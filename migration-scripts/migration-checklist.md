# 🚀 AWS Migration Checklist for Double Kings Fitness

## Pre-Migration Preparation

### ✅ **1. Account Setup**
- [ ] Create AWS account
- [ ] Set up IAM user with appropriate permissions
- [ ] Install and configure AWS CLI
- [ ] Install Node.js and npm (for building assets)
- [ ] Backup all Supabase data

### ✅ **2. Domain and SSL Setup** 
- [ ] Purchase/transfer domain to Route 53 (optional but recommended)
- [ ] Request SSL certificate in AWS Certificate Manager
- [ ] Validate SSL certificate via DNS
- [ ] Update scripts with your actual domain name

---

## Infrastructure Deployment

### ✅ **3. Database Migration**
- [ ] Run `bash migration-scripts/setup-rds.sh`
- [ ] Update security group to allow your IP
- [ ] Export data from Supabase using `node migration-scripts/export-supabase-data.js`
- [ ] Create database schema in RDS
- [ ] Import data to RDS PostgreSQL
- [ ] Test database connectivity

### ✅ **4. Storage Setup**
- [ ] Run `bash migration-scripts/setup-s3.sh`
- [ ] Update bucket names in all scripts
- [ ] Test S3 bucket access
- [ ] Configure CORS if needed

### ✅ **5. CDN and SSL**
- [ ] Run `bash migration-scripts/setup-ssl-cloudfront.sh`
- [ ] Wait for CloudFront distribution deployment (15-20 minutes)
- [ ] Update DNS records to point to CloudFront
- [ ] Test HTTPS access

### ✅ **6. Security (WAF)**
- [ ] Get CloudFront distribution ID from previous step
- [ ] Update `setup-waf.sh` with actual distribution ID
- [ ] Run `bash migration-scripts/setup-waf.sh`
- [ ] Test WAF rules are working

### ✅ **7. Monitoring (CloudWatch)**
- [ ] Update email address in `setup-cloudwatch.sh`
- [ ] Run `bash migration-scripts/setup-cloudwatch.sh`
- [ ] Confirm email subscription for alerts
- [ ] Check CloudWatch dashboard

---

## Application Migration

### ✅ **8. Code Updates**
- [ ] Update `js/aws-config.js` with actual AWS resource ARNs
- [ ] Replace Supabase imports with AWS config imports
- [ ] Update authentication logic to use Cognito
- [ ] Update database queries to use RDS
- [ ] Update file upload to use S3
- [ ] Test all functionality locally

### ✅ **9. Backend API (Lambda + API Gateway)**
- [ ] Create Lambda functions for:
  - [ ] Authentication endpoints
  - [ ] Database operations
  - [ ] File upload/delete
  - [ ] Metrics and logging
- [ ] Set up API Gateway
- [ ] Configure Cognito User Pool and App Client
- [ ] Test API endpoints

### ✅ **10. Deployment**
- [ ] Update all bucket names and resource ARNs in deployment script
- [ ] Run `bash migration-scripts/deploy-to-aws.sh`
- [ ] Test website functionality
- [ ] Create CloudFront invalidation if needed

---

## Post-Migration Testing

### ✅ **11. Functionality Testing**
- [ ] User registration works
- [ ] User login/logout works
- [ ] Workout logging works
- [ ] Progress monitoring works
- [ ] Goal setting works
- [ ] File uploads work
- [ ] All forms submit properly
- [ ] Mobile responsiveness

### ✅ **12. Performance Testing**
- [ ] Page load speeds
- [ ] Database query performance
- [ ] CloudFront caching working
- [ ] Images loading quickly
- [ ] Mobile performance

### ✅ **13. Security Testing**
- [ ] HTTPS working on all pages
- [ ] WAF blocking malicious requests
- [ ] Rate limiting working
- [ ] CORS configured properly
- [ ] No exposed sensitive data

### ✅ **14. Monitoring Setup**
- [ ] CloudWatch alarms triggering
- [ ] Metrics being collected
- [ ] Error logging working
- [ ] Performance monitoring active
- [ ] Email alerts configured

---

## DNS and Go-Live

### ✅ **15. DNS Configuration**
- [ ] Create CNAME record pointing to CloudFront distribution
- [ ] Create A record (alias) pointing to CloudFront
- [ ] Test DNS propagation
- [ ] Update any external services with new domain

### ✅ **16. Final Checks**
- [ ] All environment variables set
- [ ] Database connections working
- [ ] SSL certificate active
- [ ] Backup systems in place
- [ ] Monitoring dashboards accessible

---

## Cost Optimization

### ✅ **17. AWS Cost Management**
- [ ] Set up billing alerts
- [ ] Review resource usage
- [ ] Enable S3 lifecycle policies
- [ ] Configure RDS automated backups
- [ ] Set up CloudWatch log retention

---

## Key Commands to Run (in order)

```bash
# 1. Export Supabase data
node migration-scripts/export-supabase-data.js

# 2. Set up infrastructure
bash migration-scripts/setup-rds.sh
bash migration-scripts/setup-s3.sh
bash migration-scripts/setup-ssl-cloudfront.sh

# 3. Configure security and monitoring
bash migration-scripts/setup-waf.sh
bash migration-scripts/setup-cloudwatch.sh

# 4. Deploy application
bash migration-scripts/deploy-to-aws.sh
```

---

## Important Notes

### 🔐 **Security Considerations**
- Change all default passwords
- Use IAM roles instead of access keys where possible
- Enable MFA on AWS root account
- Regularly rotate access keys
- Monitor AWS CloudTrail logs

### 💰 **Cost Considerations**
- RDS instances can be expensive - use t3.micro for development
- CloudFront has free tier limits
- S3 charges for storage and requests
- Set up billing alerts to avoid surprises

### 🔄 **Backup Strategy**
- RDS automated backups enabled
- S3 versioning enabled for important buckets
- Regular exports of database
- Configuration backups in version control

### 📊 **Performance Optimization**
- Enable CloudFront compression
- Use WebP images where possible
- Minify CSS/JS files
- Implement lazy loading for images
- Use CDN for static assets

---

## Troubleshooting Common Issues

### **Database Connection Issues**
- Check security group rules
- Verify RDS endpoint URL
- Ensure SSL connections enabled
- Check credentials in Secrets Manager

### **CloudFront Not Updating**
- Create invalidation for changed files
- Wait for distribution deployment
- Check cache-control headers
- Clear browser cache

### **WAF Blocking Legitimate Traffic**
- Review WAF logs in CloudWatch
- Adjust rate limiting rules
- Whitelist known good IPs
- Check geographic restrictions

### **High AWS Costs**
- Review AWS Cost Explorer
- Check for unused resources
- Optimize database instance size
- Implement S3 lifecycle policies

---

## Success Metrics

After migration, you should have:
- ✅ 99.9%+ uptime
- ✅ < 3 second page load times
- ✅ Secure HTTPS everywhere
- ✅ Automated monitoring and alerts
- ✅ Scalable infrastructure
- ✅ Cost-effective resource usage

---

## Support Resources

- **AWS Documentation**: https://docs.aws.amazon.com/
- **AWS Support Center**: https://console.aws.amazon.com/support/
- **AWS Community Forums**: https://forums.aws.amazon.com/
- **AWS Architecture Center**: https://aws.amazon.com/architecture/

---

*This checklist ensures a smooth migration from Supabase to AWS with enterprise-grade security, monitoring, and performance.* 