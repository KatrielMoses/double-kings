#!/bin/bash

# AWS RDS Setup Script for Double Kings Fitness
echo "🚀 Setting up AWS RDS PostgreSQL instance..."

# Variables
DB_INSTANCE_IDENTIFIER="double-kings-fitness-db"
DB_NAME="fitness_db"
DB_USERNAME="fitness_admin"
DB_PASSWORD="YourSecurePassword123!"  # Change this!
DB_CLASS="db.t3.micro"  # Free tier eligible
REGION="us-east-1"
VPC_SECURITY_GROUP_ID="sg-xxxxxxxxx"  # Replace with your security group

# Create DB subnet group
echo "📋 Creating DB subnet group..."
aws rds create-db-subnet-group \
    --db-subnet-group-name fitness-db-subnet-group \
    --db-subnet-group-description "Subnet group for Double Kings Fitness DB" \
    --subnet-ids subnet-xxxxxxxxx subnet-yyyyyyyyy \
    --region $REGION

# Create RDS instance
echo "🔧 Creating RDS PostgreSQL instance..."
aws rds create-db-instance \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --db-instance-class $DB_CLASS \
    --engine postgres \
    --engine-version 15.4 \
    --master-username $DB_USERNAME \
    --master-user-password $DB_PASSWORD \
    --allocated-storage 20 \
    --db-name $DB_NAME \
    --vpc-security-group-ids $VPC_SECURITY_GROUP_ID \
    --db-subnet-group-name fitness-db-subnet-group \
    --backup-retention-period 7 \
    --storage-encrypted \
    --enable-performance-insights \
    --performance-insights-retention-period 7 \
    --deletion-protection \
    --region $REGION

echo "⏳ Waiting for RDS instance to be available..."
aws rds wait db-instance-available \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --region $REGION

# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text \
    --region $REGION)

echo "✅ RDS instance created successfully!"
echo "📝 Database Details:"
echo "   Endpoint: $RDS_ENDPOINT"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USERNAME"
echo "   Port: 5432"
echo ""
echo "🔗 Connection string:"
echo "   postgresql://$DB_USERNAME:$DB_PASSWORD@$RDS_ENDPOINT:5432/$DB_NAME" 