#!/bin/bash

# CloudWatch Monitoring Setup for Double Kings Fitness
echo "📊 Setting up CloudWatch monitoring..."

# Variables
REGION="us-east-1"
DISTRIBUTION_ID="YOUR_CLOUDFRONT_DISTRIBUTION_ID"
RDS_INSTANCE="double-kings-fitness-db"
S3_BUCKET="double-kings-fitness-app"
EMAIL="your-email@example.com"  # Replace with your email

# Create SNS topic for alerts
echo "📧 Creating SNS topic for alerts..."
SNS_TOPIC_ARN=$(aws sns create-topic \
    --name "fitness-app-alerts" \
    --region $REGION \
    --query 'TopicArn' \
    --output text)

# Subscribe email to SNS topic
aws sns subscribe \
    --topic-arn $SNS_TOPIC_ARN \
    --protocol email \
    --notification-endpoint $EMAIL \
    --region $REGION

echo "📩 Please confirm subscription in your email: $EMAIL"

# Create CloudWatch alarms for RDS
echo "💾 Creating RDS monitoring alarms..."

# RDS CPU Utilization
aws cloudwatch put-metric-alarm \
    --alarm-name "RDS-HighCPU-DoubleFitness" \
    --alarm-description "RDS CPU utilization is too high" \
    --metric-name CPUUtilization \
    --namespace AWS/RDS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN \
    --dimensions Name=DBInstanceIdentifier,Value=$RDS_INSTANCE \
    --region $REGION

# RDS Database Connections
aws cloudwatch put-metric-alarm \
    --alarm-name "RDS-HighConnections-DoubleFitness" \
    --alarm-description "Too many database connections" \
    --metric-name DatabaseConnections \
    --namespace AWS/RDS \
    --statistic Average \
    --period 300 \
    --threshold 50 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN \
    --dimensions Name=DBInstanceIdentifier,Value=$RDS_INSTANCE \
    --region $REGION

# Create CloudWatch alarms for CloudFront
echo "☁️ Creating CloudFront monitoring alarms..."

# CloudFront 4xx Error Rate
aws cloudwatch put-metric-alarm \
    --alarm-name "CloudFront-High4xxErrors-DoubleFitness" \
    --alarm-description "High 4xx error rate in CloudFront" \
    --metric-name 4xxErrorRate \
    --namespace AWS/CloudFront \
    --statistic Average \
    --period 300 \
    --threshold 5 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN \
    --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
    --region $REGION

# CloudFront 5xx Error Rate
aws cloudwatch put-metric-alarm \
    --alarm-name "CloudFront-High5xxErrors-DoubleFitness" \
    --alarm-description "High 5xx error rate in CloudFront" \
    --metric-name 5xxErrorRate \
    --namespace AWS/CloudFront \
    --statistic Average \
    --period 300 \
    --threshold 1 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN \
    --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
    --region $REGION

# Create comprehensive CloudWatch dashboard
echo "📈 Creating comprehensive monitoring dashboard..."
cat > fitness-dashboard.json << EOF
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
                    ["AWS/CloudFront", "Requests", "DistributionId", "$DISTRIBUTION_ID"],
                    [".", "BytesDownloaded", ".", "."],
                    [".", "BytesUploaded", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "CloudFront Traffic",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/CloudFront", "4xxErrorRate", "DistributionId", "$DISTRIBUTION_ID"],
                    [".", "5xxErrorRate", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "CloudFront Error Rates",
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
                    ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "$RDS_INSTANCE"],
                    [".", "DatabaseConnections", ".", "."],
                    [".", "FreeableMemory", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "RDS Performance",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 6,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/S3", "BucketSizeBytes", "BucketName", "$S3_BUCKET", "StorageType", "StandardStorage"],
                    [".", "NumberOfObjects", ".", ".", ".", "AllStorageTypes"]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "S3 Storage Metrics",
                "period": 86400
            }
        },
        {
            "type": "log",
            "x": 0,
            "y": 12,
            "width": 24,
            "height": 6,
            "properties": {
                "query": "SOURCE '/aws/cloudfront/distribution/$DISTRIBUTION_ID'\n| fields @timestamp, c-ip, sc-status, cs-uri-stem\n| filter sc-status >= 400\n| stats count() by sc-status\n| sort sc-status",
                "region": "us-east-1",
                "title": "CloudFront Error Analysis",
                "view": "table"
            }
        }
    ]
}
EOF

aws cloudwatch put-dashboard \
    --dashboard-name "DoubleKingsFitness-Main" \
    --dashboard-body file://fitness-dashboard.json \
    --region $REGION

# Create custom metric for user registrations (example)
echo "👥 Setting up custom metrics..."
cat > custom-metrics.json << EOF
{
    "MetricData": [
        {
            "MetricName": "UserRegistrations",
            "Dimensions": [
                {
                    "Name": "Application",
                    "Value": "DoubleKingsFitness"
                }
            ],
            "Value": 0,
            "Unit": "Count"
        }
    ]
}
EOF

aws cloudwatch put-metric-data \
    --namespace "DoubleFitness/Application" \
    --cli-input-json file://custom-metrics.json \
    --region $REGION

# Create log groups for application logs
echo "📝 Creating CloudWatch log groups..."
aws logs create-log-group \
    --log-group-name "/doublefitness/application" \
    --region $REGION

aws logs create-log-group \
    --log-group-name "/doublefitness/errors" \
    --region $REGION

# Set log retention policy
aws logs put-retention-policy \
    --log-group-name "/doublefitness/application" \
    --retention-in-days 30 \
    --region $REGION

aws logs put-retention-policy \
    --log-group-name "/doublefitness/errors" \
    --retention-in-days 90 \
    --region $REGION

# Create CloudWatch insights queries
echo "🔍 Setting up CloudWatch Insights queries..."
cat > insights-queries.json << EOF
{
    "queries": [
        {
            "name": "Top Error Messages",
            "query": "fields @timestamp, @message\n| filter @message like /ERROR/\n| stats count() by @message\n| sort count desc\n| limit 10"
        },
        {
            "name": "User Activity",
            "query": "fields @timestamp, user_id, action\n| filter action like /login|signup|workout/\n| stats count() by action\n| sort count desc"
        },
        {
            "name": "Performance Metrics",
            "query": "fields @timestamp, @message\n| filter @message like /response_time/\n| parse @message /response_time: (?<time>\\d+)ms/\n| stats avg(time), max(time), min(time) by bin(5m)"
        }
    ]
}
EOF

echo "✅ CloudWatch monitoring setup completed!"
echo "📝 Monitoring Details:"
echo "   SNS Topic ARN: $SNS_TOPIC_ARN"
echo "   Dashboard: DoubleKingsFitness-Main"
echo "   Log Groups: /doublefitness/application, /doublefitness/errors"
echo ""
echo "🚨 Alarms created:"
echo "   ✓ RDS High CPU (>80%)"
echo "   ✓ RDS High Connections (>50)"
echo "   ✓ CloudFront 4xx Error Rate (>5%)"
echo "   ✓ CloudFront 5xx Error Rate (>1%)"
echo ""
echo "📊 Access your dashboard:"
echo "   https://console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=DoubleKingsFitness-Main"

# Cleanup
rm -f fitness-dashboard.json custom-metrics.json insights-queries.json 