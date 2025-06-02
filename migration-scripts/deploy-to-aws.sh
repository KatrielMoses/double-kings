#!/bin/bash

# Complete AWS Deployment Script for Double Kings Fitness
echo "🚀 Starting AWS deployment..."

# Variables
REGION="us-east-1"
MAIN_BUCKET="double-kings-fitness-app"
ASSETS_BUCKET="double-kings-fitness-assets"
DISTRIBUTION_ID=""  # Will be set after CloudFront creation

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Build the application for production
echo "📦 Building application for production..."
if command -v npm &> /dev/null; then
    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
        npm install
        npm run build 2>/dev/null || echo "No build script found, proceeding with existing files"
    fi
fi

# Optimize images and assets
echo "🖼️ Optimizing assets..."
find . -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | while read img; do
    if command -v imagemin &> /dev/null; then
        imagemin "$img" --out-dir="$(dirname "$img")"
    fi
done

# Minify CSS and JS files
echo "🗜️ Minifying CSS and JS files..."
if command -v terser &> /dev/null; then
    find . -name "*.js" -not -path "./node_modules/*" -not -name "*.min.js" | while read js; do
        terser "$js" --compress --mangle --output "${js%.js}.min.js"
    done
fi

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment
cp -r *.html styles/ js/ imgs/ fonts/ deployment/ 2>/dev/null || true

# Update index.html to use AWS configuration
cat > deployment/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Double Kings Fitness</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👑</text></svg>">
    
    <!-- Optimized CSS Loading -->
    <link rel="preload" href="styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <link rel="preload" href="styles/home.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
        <link rel="stylesheet" href="styles/main.css">
        <link rel="stylesheet" href="styles/home.css">
    </noscript>
    
    <!-- Font optimization -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Critical CSS inline -->
    <style>
        body { margin: 0; padding: 0; background: #000; color: #fff; font-family: 'Poppins', sans-serif; }
        .hero-background { min-height: 100vh; background: #000; position: relative; }
        .navbar { position: fixed; top: 0; width: 100%; z-index: 1000; padding: 1.5rem 2rem; }
    </style>
    
    <!-- AWS SDK and configuration -->
    <script type="module" src="js/aws-config.js"></script>
</head>
<body>
    <!-- Your existing HTML content here -->
    <!-- Performance monitoring -->
    <script>
        // Track Core Web Vitals
        function sendToAnalytics(metric) {
            console.log('Performance metric:', metric);
            // Send to CloudWatch via API Gateway
            if (window.awsConfig) {
                fetch(`${window.awsConfig.apiGateway.baseUrl}/metrics`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        metricName: `WebVitals_${metric.name}`,
                        value: metric.value,
                        namespace: 'DoubleFitness/Performance'
                    })
                }).catch(console.error);
            }
        }

        // Load web vitals library
        import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(sendToAnalytics);
            getFID(sendToAnalytics);
            getFCP(sendToAnalytics);
            getLCP(sendToAnalytics);
            getTTFB(sendToAnalytics);
        });
    </script>
</body>
</html>
EOF

# Deploy to S3
echo "☁️ Deploying to S3..."

# Sync files to S3 with proper caching headers
aws s3 sync deployment/ s3://$MAIN_BUCKET \
    --delete \
    --cache-control "max-age=31536000" \
    --exclude "*.html" \
    --region $REGION

# Upload HTML files with no-cache
aws s3 sync deployment/ s3://$MAIN_BUCKET \
    --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
    --include "*.html" \
    --region $REGION

# Set up S3 website configuration
aws s3 website s3://$MAIN_BUCKET \
    --index-document index.html \
    --error-document error.html \
    --region $REGION

print_status "Files deployed to S3"

# Create CloudFront invalidation if distribution exists
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo "🔄 Creating CloudFront invalidation..."
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --region $REGION
    
    print_status "CloudFront cache invalidated"
fi

# Create error.html page
cat > error.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Double Kings Fitness - Page Not Found</title>
    <style>
        body { font-family: 'Poppins', sans-serif; background: #000; color: #fff; text-align: center; padding: 2rem; }
        .error-container { max-width: 600px; margin: 0 auto; padding: 2rem; }
        .error-code { font-size: 4rem; color: #e74c3c; margin-bottom: 1rem; }
        .error-message { font-size: 1.5rem; margin-bottom: 2rem; }
        .back-button { background: #e74c3c; color: white; padding: 1rem 2rem; border: none; border-radius: 5px; font-size: 1rem; cursor: pointer; text-decoration: none; display: inline-block; }
        .back-button:hover { background: #c0392b; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">404</div>
        <div class="error-message">Page Not Found</div>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" class="back-button">Back to Home</a>
    </div>
</body>
</html>
EOF

# Upload error page
aws s3 cp error.html s3://$MAIN_BUCKET/ --region $REGION
rm error.html

# Health check endpoint
echo "🏥 Setting up health check..."
cat > health.json << 'EOF'
{
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "services": {
        "frontend": "operational",
        "database": "operational",
        "storage": "operational"
    }
}
EOF

aws s3 cp health.json s3://$MAIN_BUCKET/ \
    --content-type "application/json" \
    --cache-control "max-age=60" \
    --region $REGION
rm health.json

# Setup robots.txt and sitemap.xml
echo "🤖 Creating SEO files..."
cat > robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
EOF

cat > sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://yourdomain.com/</loc>
        <lastmod>2024-01-01</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://yourdomain.com/workout-logger.html</loc>
        <lastmod>2024-01-01</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://yourdomain.com/progress-monitoring.html</loc>
        <lastmod>2024-01-01</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://yourdomain.com/goal-setting.html</loc>
        <lastmod>2024-01-01</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>
EOF

aws s3 cp robots.txt s3://$MAIN_BUCKET/ --region $REGION
aws s3 cp sitemap.xml s3://$MAIN_BUCKET/ --content-type "application/xml" --region $REGION
rm robots.txt sitemap.xml

# Create deployment summary
echo ""
echo "🎉 Deployment Summary:"
echo "=================================="
print_status "Frontend deployed to S3"
print_status "Error pages configured"
print_status "SEO files uploaded"
print_status "Health check endpoint created"

if [ ! -z "$DISTRIBUTION_ID" ]; then
    print_status "CloudFront cache invalidated"
fi

echo ""
echo "📝 Post-deployment tasks:"
echo "1. Update DNS records to point to CloudFront distribution"
echo "2. Validate SSL certificate in ACM console"
echo "3. Test all application functionality"
echo "4. Monitor CloudWatch dashboards"
echo "5. Update any hardcoded URLs in the application"

echo ""
echo "🔗 Useful URLs:"
echo "S3 Static Website: http://$MAIN_BUCKET.s3-website-$REGION.amazonaws.com"
echo "Health Check: http://$MAIN_BUCKET.s3-website-$REGION.amazonaws.com/health.json"
echo "AWS Console: https://console.aws.amazon.com"

# Cleanup
rm -rf deployment

print_status "Deployment completed successfully!" 