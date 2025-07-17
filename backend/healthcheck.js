#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const TIMEOUT = 5000; // 5 seconds timeout

function checkHealth() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/health',
            method: 'GET',
            timeout: TIMEOUT
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const healthData = JSON.parse(data);
                    
                    // Check if service is responding
                    if (res.statusCode === 200 && healthData.status === 'ok') {
                        resolve({
                            status: 'healthy',
                            timestamp: healthData.timestamp,
                            details: healthData
                        });
                    } else {
                        reject({
                            status: 'unhealthy',
                            statusCode: res.statusCode,
                            data: healthData
                        });
                    }
                } catch (error) {
                    reject({
                        status: 'unhealthy',
                        error: 'Invalid JSON response',
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                status: 'unhealthy',
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject({
                status: 'unhealthy',
                error: 'Request timeout'
            });
        });

        req.end();
    });
}

function checkDependencies() {
    const checks = {
        uploadsDirectory: false,
        metadataFile: false,
        googleDriveConfig: false
    };

    // Check uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    try {
        const stat = fs.statSync(uploadsDir);
        checks.uploadsDirectory = stat.isDirectory();
    } catch (error) {
        checks.uploadsDirectory = false;
    }

    // Check metadata file
    const metadataFile = path.join(__dirname, 'metadata.json');
    try {
        fs.accessSync(metadataFile, fs.constants.R_OK | fs.constants.W_OK);
        checks.metadataFile = true;
    } catch (error) {
        checks.metadataFile = false;
    }

    // Check Google Drive configuration
    const hasGoogleDriveConfig = !!(
        process.env.GOOGLE_DRIVE_FOLDER_ID &&
        process.env.GOOGLE_CLIENT_EMAIL &&
        process.env.GOOGLE_PRIVATE_KEY
    );
    checks.googleDriveConfig = hasGoogleDriveConfig;

    return checks;
}

async function main() {
    try {
        console.log('🔍 Running health check...');
        
        // Check HTTP health endpoint
        const health = await checkHealth();
        console.log('✅ HTTP Health Check:', health.status);
        
        // Check dependencies
        const deps = checkDependencies();
        console.log('📋 Dependencies Check:');
        console.log('  - Uploads Directory:', deps.uploadsDirectory ? '✅' : '❌');
        console.log('  - Metadata File:', deps.metadataFile ? '✅' : '❌');
        console.log('  - Google Drive Config:', deps.googleDriveConfig ? '✅' : '⚠️  (Optional)');
        
        // Overall health status
        const criticalChecks = [deps.uploadsDirectory, deps.metadataFile];
        const allCriticalPassed = criticalChecks.every(check => check === true);
        
        if (allCriticalPassed) {
            console.log('🎉 Overall Status: HEALTHY');
            process.exit(0);
        } else {
            console.log('❌ Overall Status: UNHEALTHY');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Health Check Failed:', error.error || error.message);
        console.error('📊 Details:', error);
        process.exit(1);
    }
}

// Run health check if called directly
if (require.main === module) {
    main();
}

module.exports = { checkHealth, checkDependencies };