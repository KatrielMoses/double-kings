const auth0Config = {
    domain: 'dev-p2dtfh6j7hgsn7os.us.auth0.com',
    clientId: 'bs1ziiGZ5bnRwMZFRfBlwilTBrUC78tb',
    redirectUri: 'http://localhost:3000',

    // Additional configuration for social logins
    authorizationParams: {
        response_type: 'code',
        scope: 'openid profile email',
        redirect_uri: 'http://localhost:3000'
    },

    // Customize the appearance
    appearance: {
        theme: {
            primaryColor: '#3498db'
        }
    },

    // Specify the client authentication method
    useFormData: true,
    cacheLocation: 'localstorage'
}; 