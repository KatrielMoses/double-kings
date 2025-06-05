# Double Kings Fitness - AWS Deployment Script
# This script deploys the website to S3 and invalidates CloudFront cache

Write-Host "🚀 Starting deployment to AWS..." -ForegroundColor Green

# Configuration
$BUCKET_NAME = "double-kings-fitness-app"
$CLOUDFRONT_DISTRIBUTION_ID = ""  # You'll need to provide this
$REGION = "us-east-1"

# Check if CloudFront distribution ID is provided
if ([string]::IsNullOrEmpty($CLOUDFRONT_DISTRIBUTION_ID)) {
    Write-Host "⚠️  Getting CloudFront distribution ID..." -ForegroundColor Yellow
    try {
        $distributions = aws cloudfront list-distributions --query "DistributionList.Items[?contains(Aliases.Items, 'doublekings-lifting.app')].Id" --output text --region $REGION
        if ($distributions) {
            $CLOUDFRONT_DISTRIBUTION_ID = $distributions.Trim()
            Write-Host "✅ Found CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Could not find CloudFront distribution for doublekings-lifting.app" -ForegroundColor Red
            Write-Host "Please check your domain configuration or provide the distribution ID manually." -ForegroundColor Yellow
            exit 1
        }
    }
    catch {
        Write-Host "❌ Error getting CloudFront distribution: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📦 Syncing files to S3 bucket: $BUCKET_NAME" -ForegroundColor Blue

# List of files and directories to upload
$filesToUpload = @(
    "index.html",
    "free-demo.html", 
    "workout-logger.html",
    "progress-monitoring.html",
    "goal-setting.html",
    "my-templates.html",
    "test-exercise-modal.html",
    "google-callback.html",
    "styles/",
    "js/",
    "imgs/",
    "fonts/"
)

# Sync each file/directory
foreach ($item in $filesToUpload) {
    if (Test-Path $item) {
        Write-Host "📁 Uploading: $item" -ForegroundColor Cyan
        
        if (Test-Path $item -PathType Container) {
            # It's a directory
            aws s3 sync $item "s3://$BUCKET_NAME/$item" --region $REGION --delete
        }
        else {
            # It's a file
            aws s3 cp $item "s3://$BUCKET_NAME/$item" --region $REGION
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully uploaded: $item" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Failed to upload: $item" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "⚠️  File/directory not found: $item" -ForegroundColor Yellow
    }
}

# Set proper content types for HTML files
Write-Host "🔧 Setting content types..." -ForegroundColor Blue

$htmlFiles = @("index.html", "free-demo.html", "workout-logger.html", "progress-monitoring.html", "goal-setting.html", "my-templates.html", "test-exercise-modal.html", "google-callback.html")

foreach ($htmlFile in $htmlFiles) {
    if (Test-Path $htmlFile) {
        aws s3 cp $htmlFile "s3://$BUCKET_NAME/$htmlFile" --content-type "text/html" --metadata-directive REPLACE --region $REGION
        Write-Host "✅ Set content-type for: $htmlFile" -ForegroundColor Green
    }
}

# Set content types for CSS files
Get-ChildItem -Path "styles" -Filter "*.css" -Recurse | ForEach-Object {
    $key = $_.FullName.Replace((Get-Location).Path, "").Replace("\", "/").TrimStart("/")
    aws s3 cp $_.FullName "s3://$BUCKET_NAME/$key" --content-type "text/css" --metadata-directive REPLACE --region $REGION
    Write-Host "✅ Set content-type for: $key" -ForegroundColor Green
}

# Set content types for JS files  
Get-ChildItem -Path "js" -Filter "*.js" -Recurse | ForEach-Object {
    $key = $_.FullName.Replace((Get-Location).Path, "").Replace("\", "/").TrimStart("/")
    aws s3 cp $_.FullName "s3://$BUCKET_NAME/$key" --content-type "application/javascript" --metadata-directive REPLACE --region $REGION
    Write-Host "✅ Set content-type for: $key" -ForegroundColor Green
}

Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Blue

# Create CloudFront invalidation
try {
    $invalidationResult = aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*" --region $REGION --output json | ConvertFrom-Json
    
    if ($invalidationResult.Invalidation.Id) {
        Write-Host "✅ CloudFront invalidation created: $($invalidationResult.Invalidation.Id)" -ForegroundColor Green
        Write-Host "⏱️  Invalidation status: $($invalidationResult.Invalidation.Status)" -ForegroundColor Yellow
        Write-Host "📝 Note: It may take 5-10 minutes for changes to propagate globally." -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Failed to create CloudFront invalidation" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Error creating CloudFront invalidation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your website is available at:" -ForegroundColor Cyan
Write-Host "   • https://doublekings-lifting.app" -ForegroundColor White
Write-Host "   • https://www.doublekings-lifting.app" -ForegroundColor White
Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Blue
Write-Host "   • S3 Bucket: $BUCKET_NAME" -ForegroundColor White
Write-Host "   • CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID" -ForegroundColor White
Write-Host "   • Region: $REGION" -ForegroundColor White
Write-Host ""
Write-Host "⚡ Changes should be live in 5-10 minutes after cache invalidation completes." -ForegroundColor Yellow 