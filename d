[33mcommit 4b03c1f5f1a91094f4281d2ecd29c433e698eaa7[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mfeature/oauth-implementation[m[33m)[m
Author: Your Name <your.email@example.com>
Date:   Fri Oct 3 21:04:58 2025 +0800

    Remove hardcoded passwords from source code
    
    - Replace hardcoded password with environment variables
    - Use process.env.EMAIL_PASS for email authentication
    - Fix repository rule violations for sensitive data

api/emailServiceV2.js
my-upload-server/config.js
