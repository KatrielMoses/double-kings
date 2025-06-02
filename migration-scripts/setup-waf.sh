#!/bin/bash

# AWS WAF Setup for Double Kings Fitness
echo "🛡️ Setting up AWS WAF..."

# Variables
WAF_NAME="double-kings-fitness-waf"
DISTRIBUTION_ID="YOUR_CLOUDFRONT_DISTRIBUTION_ID"  # Replace with actual ID
REGION="us-east-1"

# Create IP set for rate limiting
echo "🔍 Creating IP sets..."
IP_SET_ARN=$(aws wafv2 create-ip-set \
    --name "fitness-blocked-ips" \
    --scope CLOUDFRONT \
    --ip-address-version IPV4 \
    --addresses "192.0.2.44/32" \
    --description "Blocked IPs for Double Kings Fitness" \
    --region $REGION \
    --query 'Summary.ARN' \
    --output text)

# Create Web ACL with rules
echo "📋 Creating Web ACL with security rules..."
cat > waf-rules.json << EOF
{
    "Name": "$WAF_NAME",
    "Scope": "CLOUDFRONT",
    "Description": "WAF for Double Kings Fitness website",
    "DefaultAction": {
        "Allow": {}
    },
    "Rules": [
        {
            "Name": "AWSManagedRulesCommonRuleSet",
            "Priority": 1,
            "OverrideAction": {
                "None": {}
            },
            "Statement": {
                "ManagedRuleGroupStatement": {
                    "VendorName": "AWS",
                    "Name": "AWSManagedRulesCommonRuleSet"
                }
            },
            "VisibilityConfig": {
                "SampledRequestsEnabled": true,
                "CloudWatchMetricsEnabled": true,
                "MetricName": "CommonRuleSetMetric"
            }
        },
        {
            "Name": "AWSManagedRulesKnownBadInputsRuleSet",
            "Priority": 2,
            "OverrideAction": {
                "None": {}
            },
            "Statement": {
                "ManagedRuleGroupStatement": {
                    "VendorName": "AWS",
                    "Name": "AWSManagedRulesKnownBadInputsRuleSet"
                }
            },
            "VisibilityConfig": {
                "SampledRequestsEnabled": true,
                "CloudWatchMetricsEnabled": true,
                "MetricName": "KnownBadInputsRuleSetMetric"
            }
        },
        {
            "Name": "RateLimitRule",
            "Priority": 3,
            "Action": {
                "Block": {}
            },
            "Statement": {
                "RateBasedStatement": {
                    "Limit": 2000,
                    "AggregateKeyType": "IP"
                }
            },
            "VisibilityConfig": {
                "SampledRequestsEnabled": true,
                "CloudWatchMetricsEnabled": true,
                "MetricName": "RateLimitRuleMetric"
            }
        },
        {
            "Name": "GeoBlockRule",
            "Priority": 4,
            "Action": {
                "Block": {}
            },
            "Statement": {
                "GeoMatchStatement": {
                    "CountryCodes": ["CN", "RU"]
                }
            },
            "VisibilityConfig": {
                "SampledRequestsEnabled": true,
                "CloudWatchMetricsEnabled": true,
                "MetricName": "GeoBlockRuleMetric"
            }
        }
    ],
    "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "DoubleKingsFitnessWAFMetric"
    }
}
EOF

# Create the Web ACL
WEB_ACL_ARN=$(aws wafv2 create-web-acl \
    --cli-input-json file://waf-rules.json \
    --region $REGION \
    --query 'Summary.ARN' \
    --output text)

echo "📋 Web ACL ARN: $WEB_ACL_ARN"

# Associate WAF with CloudFront distribution
echo "🔗 Associating WAF with CloudFront distribution..."
aws wafv2 associate-web-acl \
    --web-acl-arn $WEB_ACL_ARN \
    --resource-arn "arn:aws:cloudfront::$(aws sts get-caller-identity --query Account --output text):distribution/$DISTRIBUTION_ID" \
    --region $REGION

# Create CloudWatch dashboard for WAF metrics
echo "📊 Creating CloudWatch dashboard..."
cat > waf-dashboard.json << EOF
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/WAFV2", "AllowedRequests", "WebACL", "$WAF_NAME", "Region", "CloudFront", "Rule", "ALL"],
                    [".", "BlockedRequests", ".", ".", ".", ".", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "WAF Requests",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 6,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/WAFV2", "BlockedRequests", "WebACL", "$WAF_NAME", "Region", "CloudFront", "Rule", "RateLimitRule"],
                    [".", ".", ".", ".", ".", ".", ".", "GeoBlockRule"]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "Blocked Requests by Rule",
                "period": 300
            }
        }
    ]
}
EOF

aws cloudwatch put-dashboard \
    --dashboard-name "DoubleKingsFitness-WAF" \
    --dashboard-body file://waf-dashboard.json \
    --region $REGION

echo "✅ WAF setup completed successfully!"
echo "📝 WAF Details:"
echo "   Web ACL ARN: $WEB_ACL_ARN"
echo "   IP Set ARN: $IP_SET_ARN"
echo ""
echo "🔒 Security rules enabled:"
echo "   ✓ Common web application attacks protection"
echo "   ✓ Known bad inputs protection"
echo "   ✓ Rate limiting (2000 requests per 5 minutes)"
echo "   ✓ Geographic blocking (China, Russia)"
echo ""
echo "📊 CloudWatch dashboard created: DoubleKingsFitness-WAF"

# Cleanup
rm -f waf-rules.json waf-dashboard.json 