#!/bin/bash

# S3 Setup Script for Double Kings Fitness
echo "🪣 Setting up S3 buckets..."

# Variables
REGION="us-east-1"
MAIN_BUCKET="double-kings-fitness-app"
ASSETS_BUCKET="double-kings-fitness-assets"
BACKUPS_BUCKET="double-kings-fitness-backups"

# Create main application bucket
echo "📦 Creating main S3 bucket..."
aws s3 mb s3://$MAIN_BUCKET --region $REGION

# Create assets bucket for images, videos, etc.
echo "🖼️ Creating assets bucket..."
aws s3 mb s3://$ASSETS_BUCKET --region $REGION

# Create backups bucket
echo "💾 Creating backups bucket..."
aws s3 mb s3://$BACKUPS_BUCKET --region $REGION

# Configure bucket policies
echo "🔒 Setting up bucket policies..."

# Main bucket policy (for static website hosting)
cat > main-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$MAIN_BUCKET/*"
        }
    ]
}
EOF

# Assets bucket policy (for user uploads)
cat > assets-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowAuthenticatedUsers",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::677276083971:root"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::$ASSETS_BUCKET/*"
        }
    ]
}
EOF

# Apply bucket policies
aws s3api put-bucket-policy --bucket $MAIN_BUCKET --policy file://main-bucket-policy.json
aws s3api put-bucket-policy --bucket $ASSETS_BUCKET --policy file://assets-bucket-policy.json

# Enable versioning for backups bucket
aws s3api put-bucket-versioning --bucket $BACKUPS_BUCKET --versioning-configuration Status=Enabled

# Configure CORS for assets bucket
cat > cors-configuration.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
            "ExposeHeaders": []
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket $ASSETS_BUCKET --cors-configuration file://cors-configuration.json

# Enable static website hosting for main bucket
aws s3 website s3://$MAIN_BUCKET --index-document index.html --error-document error.html

echo "✅ S3 buckets created successfully!"
echo "📝 Bucket Details:"
echo "   Main App: s3://$MAIN_BUCKET"
echo "   Assets: s3://$ASSETS_BUCKET"
echo "   Backups: s3://$BACKUPS_BUCKET"
echo ""
echo "🌐 Website endpoint:"
echo "   http://$MAIN_BUCKET.s3-website-$REGION.amazonaws.com"

# Cleanup policy files
rm -f main-bucket-policy.json assets-bucket-policy.json cors-configuration.json 