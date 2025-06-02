#!/bin/bash

# SSL Certificate and CloudFront Setup
echo "🔒 Setting up SSL Certificate and CloudFront..."

# Variables
DOMAIN_NAME="yourdomain.com"  # Replace with your domain
MAIN_BUCKET="double-kings-fitness-app"
REGION="us-east-1"

# Request SSL certificate (must be in us-east-1 for CloudFront)
echo "📜 Requesting SSL certificate..."
CERT_ARN=$(aws acm request-certificate \
    --domain-name $DOMAIN_NAME \
    --subject-alternative-names "www.$DOMAIN_NAME" \
    --validation-method DNS \
    --region us-east-1 \
    --query 'CertificateArn' \
    --output text)

echo "📋 Certificate ARN: $CERT_ARN"
echo "⚠️  Please validate the certificate in ACM console by adding DNS records to your domain"
echo "⏳ Waiting for certificate validation..."

# Wait for certificate to be issued (you need to validate DNS first)
# aws acm wait certificate-validated --certificate-arn $CERT_ARN --region us-east-1

# Create CloudFront Origin Access Identity
echo "🆔 Creating CloudFront Origin Access Identity..."
OAI_ID=$(aws cloudfront create-cloud-front-origin-access-identity \
    --cloud-front-origin-access-identity-config \
    CallerReference="$(date +%s)",Comment="OAI for Double Kings Fitness" \
    --query 'CloudFrontOriginAccessIdentity.Id' \
    --output text)

echo "🆔 OAI ID: $OAI_ID"

# Create CloudFront distribution configuration
cat > cloudfront-config.json << EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "Double Kings Fitness CDN",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$MAIN_BUCKET",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$MAIN_BUCKET",
                "DomainName": "$MAIN_BUCKET.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": "origin-access-identity/cloudfront/$OAI_ID"
                }
            }
        ]
    },
    "DefaultRootObject": "index.html",
    "Enabled": true,
    "Aliases": {
        "Quantity": 2,
        "Items": ["$DOMAIN_NAME", "www.$DOMAIN_NAME"]
    },
    "ViewerCertificate": {
        "ACMCertificateArn": "$CERT_ARN",
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "HttpVersion": "http2",
    "IsIPV6Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

# Create CloudFront distribution
echo "☁️ Creating CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json \
    --query 'Distribution.Id' \
    --output text)

# Get distribution domain name
DISTRIBUTION_DOMAIN=$(aws cloudfront get-distribution \
    --id $DISTRIBUTION_ID \
    --query 'Distribution.DomainName' \
    --output text)

echo "✅ CloudFront distribution created successfully!"
echo "📝 Distribution Details:"
echo "   Distribution ID: $DISTRIBUTION_ID"
echo "   Domain Name: $DISTRIBUTION_DOMAIN"
echo "   Certificate ARN: $CERT_ARN"
echo ""
echo "🔗 Next steps:"
echo "   1. Validate SSL certificate in ACM console"
echo "   2. Update DNS records to point to CloudFront distribution"
echo "   3. Wait for distribution to deploy (15-20 minutes)"

# Update S3 bucket policy to allow CloudFront OAI
cat > s3-cloudfront-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity $OAI_ID"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$MAIN_BUCKET/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $MAIN_BUCKET --policy file://s3-cloudfront-policy.json

# Cleanup
rm -f cloudfront-config.json s3-cloudfront-policy.json 