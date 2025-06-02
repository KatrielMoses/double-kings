/**
 * AWS Configuration for Double Kings Fitness
 * Replaces Supabase with AWS services
 */

// AWS SDK Configuration
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { S3Client } from "@aws-sdk/client-s3";
import { RDSDataClient } from "@aws-sdk/client-rds-data";

// AWS Configuration
const AWS_CONFIG = {
    region: 'ap-south-1',
    cognito: {
        userPoolId: 'us-east-1_xxxxxxxxx', // Replace with your User Pool ID
        clientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx' // Replace with your App Client ID
    },
    rds: {
        endpoint: 'double-kings-fitness-db.cjaek6isoozm.ap-south-1.rds.amazonaws.com',
        port: 5432,
        database: 'fitness_db',
        username: 'fitness_admin',
        // Note: In production, use AWS Secrets Manager or environment variables
        password: 'FitnessApp123!'
    },
    s3: {
        mainBucket: 'double-kings-fitness-app',
        assetsBucket: 'double-kings-fitness-assets',
        backupsBucket: 'double-kings-fitness-backups',
        region: 'us-east-1'
    },
    cloudfront: {
        distributionId: 'E2GR7PIWRHSBPZ',
        domainName: 'dsw2vjo7jrzh1.cloudfront.net'
    },
    waf: {
        webAclId: 'edb155e5-7185-495a-af2f-6841b8ce67d8',
        arn: 'arn:aws:wafv2:us-east-1:677276083971:global/webacl/double-kings-fitness-waf/edb155e5-7185-495a-af2f-6841b8ce67d8'
    },
    sns: {
        alertsTopic: 'arn:aws:sns:ap-south-1:677276083971:fitness-app-alerts'
    },
    ssl: {
        certificateArn: 'arn:aws:acm:us-east-1:677276083971:certificate/985f8cef-dc5a-48f2-be42-50b45c0b2bbd'
    },
    apiGateway: {
        baseUrl: 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod'
    }
};

// Initialize AWS clients
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_CONFIG.region });
const s3Client = new S3Client({ region: AWS_CONFIG.region });
const rdsClient = new RDSDataClient({ region: AWS_CONFIG.region });

// Authentication Service (replaces Supabase Auth)
class AWSAuthService {
    constructor() {
        this.currentUser = null;
        this.checkAuthState();
    }

    async signUp(email, password, fullName) {
        try {
            const command = {
                ClientId: AWS_CONFIG.cognito.clientId,
                Username: email,
                Password: password,
                UserAttributes: [
                    {
                        Name: 'email',
                        Value: email
                    },
                    {
                        Name: 'name',
                        Value: fullName
                    }
                ]
            };

            const response = await cognitoClient.send(new SignUpCommand(command));

            // Send custom metric to CloudWatch
            await this.sendMetric('UserRegistrations', 1);

            return {
                success: true,
                data: response,
                needsConfirmation: true
            };
        } catch (error) {
            console.error('SignUp error:', error);
            await this.logError('AUTH_SIGNUP_ERROR', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signIn(email, password) {
        try {
            const command = {
                ClientId: AWS_CONFIG.cognito.clientId,
                AuthFlow: 'USER_PASSWORD_AUTH',
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            };

            const response = await cognitoClient.send(new InitiateAuthCommand(command));

            if (response.AuthenticationResult) {
                this.currentUser = {
                    email: email,
                    accessToken: response.AuthenticationResult.AccessToken,
                    idToken: response.AuthenticationResult.IdToken,
                    refreshToken: response.AuthenticationResult.RefreshToken
                };

                localStorage.setItem('aws_auth_user', JSON.stringify(this.currentUser));

                // Send custom metric
                await this.sendMetric('UserLogins', 1);

                return {
                    success: true,
                    data: this.currentUser
                };
            }
        } catch (error) {
            console.error('SignIn error:', error);
            await this.logError('AUTH_SIGNIN_ERROR', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signOut() {
        try {
            if (this.currentUser?.accessToken) {
                const command = {
                    AccessToken: this.currentUser.accessToken
                };
                await cognitoClient.send(new GlobalSignOutCommand(command));
            }

            this.currentUser = null;
            localStorage.removeItem('aws_auth_user');

            return { success: true };
        } catch (error) {
            console.error('SignOut error:', error);
            return { success: false, error: error.message };
        }
    }

    checkAuthState() {
        const storedUser = localStorage.getItem('aws_auth_user');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
                // Verify token validity here if needed
            } catch (error) {
                localStorage.removeItem('aws_auth_user');
            }
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Custom CloudWatch metrics
    async sendMetric(metricName, value) {
        try {
            const response = await fetch(`${AWS_CONFIG.apiGateway.baseUrl}/metrics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser?.idToken}`
                },
                body: JSON.stringify({
                    metricName,
                    value,
                    namespace: 'DoubleFitness/Application'
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Failed to send metric:', error);
        }
    }

    // Error logging to CloudWatch
    async logError(errorType, error) {
        try {
            const response = await fetch(`${AWS_CONFIG.apiGateway.baseUrl}/logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    level: 'ERROR',
                    message: `${errorType}: ${error.message}`,
                    timestamp: new Date().toISOString(),
                    stack: error.stack,
                    userAgent: navigator.userAgent
                })
            });
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }
    }
}

// Database Service (replaces Supabase Database)
class AWSDataService {
    constructor(authService) {
        this.auth = authService;
    }

    async executeQuery(sql, parameters = []) {
        try {
            const response = await fetch(`${AWS_CONFIG.apiGateway.baseUrl}/database`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.getCurrentUser()?.idToken}`
                },
                body: JSON.stringify({
                    sql,
                    parameters
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Database query failed');
            }

            return {
                success: true,
                data: result.records || []
            };
        } catch (error) {
            console.error('Database query error:', error);
            await this.auth.logError('DATABASE_QUERY_ERROR', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Workout operations
    async getWorkouts(userId) {
        const sql = `
            SELECT w.*, e.name as exercise_name, e.category 
            FROM workouts w 
            LEFT JOIN exercises e ON w.exercise_id = e.id 
            WHERE w.user_id = :userId 
            ORDER BY w.created_at DESC
        `;
        return await this.executeQuery(sql, [{ name: 'userId', value: { stringValue: userId } }]);
    }

    async addWorkout(workoutData) {
        const sql = `
            INSERT INTO workouts (user_id, exercise_id, sets, reps, weight, duration, notes, created_at)
            VALUES (:userId, :exerciseId, :sets, :reps, :weight, :duration, :notes, NOW())
            RETURNING *
        `;
        return await this.executeQuery(sql, [
            { name: 'userId', value: { stringValue: workoutData.userId } },
            { name: 'exerciseId', value: { longValue: workoutData.exerciseId } },
            { name: 'sets', value: { longValue: workoutData.sets } },
            { name: 'reps', value: { longValue: workoutData.reps } },
            { name: 'weight', value: { doubleValue: workoutData.weight } },
            { name: 'duration', value: { longValue: workoutData.duration } },
            { name: 'notes', value: { stringValue: workoutData.notes || '' } }
        ]);
    }

    // Goal operations
    async getGoals(userId) {
        const sql = `
            SELECT * FROM goals 
            WHERE user_id = :userId 
            ORDER BY created_at DESC
        `;
        return await this.executeQuery(sql, [{ name: 'userId', value: { stringValue: userId } }]);
    }

    async addGoal(goalData) {
        const sql = `
            INSERT INTO goals (user_id, title, description, target_value, current_value, target_date, category, status, created_at)
            VALUES (:userId, :title, :description, :targetValue, :currentValue, :targetDate, :category, :status, NOW())
            RETURNING *
        `;
        return await this.executeQuery(sql, [
            { name: 'userId', value: { stringValue: goalData.userId } },
            { name: 'title', value: { stringValue: goalData.title } },
            { name: 'description', value: { stringValue: goalData.description } },
            { name: 'targetValue', value: { doubleValue: goalData.targetValue } },
            { name: 'currentValue', value: { doubleValue: goalData.currentValue || 0 } },
            { name: 'targetDate', value: { stringValue: goalData.targetDate } },
            { name: 'category', value: { stringValue: goalData.category } },
            { name: 'status', value: { stringValue: goalData.status || 'active' } }
        ]);
    }
}

// File Storage Service (replaces Supabase Storage)
class AWSStorageService {
    constructor(authService) {
        this.auth = authService;
    }

    async uploadFile(file, folder = 'uploads') {
        try {
            const fileName = `${folder}/${Date.now()}-${file.name}`;

            // Get signed URL for upload
            const response = await fetch(`${AWS_CONFIG.apiGateway.baseUrl}/upload-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.getCurrentUser()?.idToken}`
                },
                body: JSON.stringify({
                    fileName,
                    fileType: file.type
                })
            });

            const { uploadUrl, fileUrl } = await response.json();

            // Upload file to S3
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (uploadResponse.ok) {
                return {
                    success: true,
                    data: {
                        url: fileUrl,
                        fileName
                    }
                };
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('File upload error:', error);
            await this.auth.logError('FILE_UPLOAD_ERROR', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteFile(fileName) {
        try {
            const response = await fetch(`${AWS_CONFIG.apiGateway.baseUrl}/delete-file`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.getCurrentUser()?.idToken}`
                },
                body: JSON.stringify({ fileName })
            });

            return {
                success: response.ok,
                error: response.ok ? null : 'Delete failed'
            };
        } catch (error) {
            console.error('File delete error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Initialize services
const authService = new AWSAuthService();
const dataService = new AWSDataService(authService);
const storageService = new AWSStorageService(authService);

// Database connection function (for Node.js backend)
function getDatabaseConnection() {
    return {
        host: AWS_CONFIG.rds.endpoint,
        port: AWS_CONFIG.rds.port,
        database: AWS_CONFIG.rds.database,
        user: AWS_CONFIG.rds.username,
        password: AWS_CONFIG.rds.password,
        ssl: {
            rejectUnauthorized: false
        }
    };
}

// S3 client configuration
function getS3Config() {
    return {
        region: AWS_CONFIG.s3.region,
        buckets: {
            main: AWS_CONFIG.s3.mainBucket,
            assets: AWS_CONFIG.s3.assetsBucket,
            backups: AWS_CONFIG.s3.backupsBucket
        }
    };
}

// CloudFront URLs
function getCloudFrontURLs() {
    return {
        main: `https://${AWS_CONFIG.cloudfront.domainName}`,
        assets: `https://${AWS_CONFIG.cloudfront.domainName}/assets/`
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AWS_CONFIG,
        getDatabaseConnection,
        getS3Config,
        getCloudFrontURLs
    };
}

// Global access for frontend
window.AWS_CONFIG = AWS_CONFIG;

export {
    authService,
    dataService,
    storageService,
    AWS_CONFIG
}; 