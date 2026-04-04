# AWS DynamoDB Setup Guide

## ✅ AWS Credentials Found!

Your AWS credentials are already configured in `.env.development`:

```bash
AWS_ACCESS_KEY_ID=AKIA5TGDZKB4GCGHBT6S ✅
AWS_SECRET_ACCESS_KEY=DK2hCiw7SbvICs9IDeSCzxZ+2+OxRpdFAJldYkWY ✅
AWS_REGION=eu-north-1 ✅
```

## 🚀 Setup AWS DynamoDB Tables (Automatic)

### **Step 1: Make Sure You're Using Real AWS DynamoDB**

The `.env.development` file has been updated to use real AWS DynamoDB (local endpoint is commented out):

```bash
# DYNAMODB_ENDPOINT=http://localhost:8000  # ← COMMENTED OUT
```

### **Step 2: Run the Auto-Setup Script**

```bash
cd apps/backend

# Option 1: Using npm script (recommended)
pnpm setup:aws

# Option 2: Direct execution
node setup-aws-dynamodb.js
```

### **What the Script Does:**

1. ✅ Connects to your AWS account using credentials from `.env.development`
2. 🔍 Checks if each DynamoDB table already exists
3. 🆕 Creates any missing tables automatically
4. 📊 Provides a summary report

### **Expected Output:**

```
🚀 Starting AWS DynamoDB Setup...

📍 Region: eu-north-1
🔑 Access Key: AKIA5TGDZ...

============================================================

🔍 Checking existing tables...

✅ EXISTS: corpus-users-dev (Status: ACTIVE)
✅ EXISTS: corpus-chatbots-dev (Status: ACTIVE)
❌ NOT FOUND: corpus-customization-dev
   Creating table...
⏳ Creating table: corpus-customization-dev...
✅ Table created: corpus-customization-dev

...

============================================================

📊 SUMMARY:

   ✅ Already existing: 5
   🆕 Newly created:    3
   ❌ Failed:           0
   📦 Total tables:     8

============================================================

🎉 Setup complete! All tables are ready.
   You can now start your backend with: pnpm dev
```

## 📋 Tables That Will Be Created

The script will create these 8 tables:

| Table Name | Partition Key | Sort Key | Purpose |
|------------|---------------|----------|---------|
| `corpus-users-dev` | username | - | User accounts |
| `corpus-chatbots-dev` | chatbotId | - | Chatbot configurations |
| `corpus-customization-dev` | chatbotId | - | Chatbot customization settings |
| `corpus-main-dev` | pk | sk | Data store records |
| `corpus-access-control-dev` | chatbotId | - | Access control settings |
| `corpus-query-log-dev` | pk | sk | Chat query logs |
| `corpus-lead-generation-dev` | pk | sk | Lead form submissions |
| `corpus-integrations-dev` | chatbotId | - | Third-party integrations |

## 💰 Cost

All tables are created with **PAY_PER_REQUEST** (On-Demand) billing mode:

- ✅ No upfront costs
- ✅ No provisioned capacity needed
- ✅ Only pay for actual requests
- ✅ First 25 GB storage is **FREE**
- ✅ First 200M requests/month are **FREE**

**For development, you'll stay in the free tier! 💰**

## ⚠️ Troubleshooting

### Error: "Invalid AWS credentials"

**Solution:** Check that your `.env.development` has valid credentials:
```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### Error: "Access Denied" or "Insufficient permissions"

**Solution:** Your IAM user needs the `AmazonDynamoDBFullAccess` policy:

1. Go to AWS IAM Console: https://console.aws.amazon.com/iam
2. Click on your user
3. Go to "Permissions" tab
4. Click "Add permissions" → "Attach policies directly"
5. Search and select `AmazonDynamoDBFullAccess`
6. Click "Add permissions"

### Error: "Table already exists"

**Solution:** This is actually good! The script will detect it and skip creation.

### Error: "Network timeout"

**Solution:** Check your internet connection and AWS region availability.

## ✅ Verify Tables in AWS Console

After running the script:

1. Go to AWS DynamoDB Console: https://console.aws.amazon.com/dynamodbv2
2. Make sure you're in the correct region: **Stockholm (eu-north-1)**
3. You should see all 8 tables listed

## 🚀 Next Steps

Once tables are created:

```bash
# Start your backend server
pnpm dev

# It will now connect to real AWS DynamoDB!
# Test it:
curl http://localhost:8001/health
```

## 🔄 Switching Back to Local DynamoDB (Docker)

If you want to go back to using local Docker DynamoDB:

1. Uncomment the line in `.env.development`:
   ```bash
   DYNAMODB_ENDPOINT=http://localhost:8000
   ```

2. Make sure Docker DynamoDB is running:
   ```bash
   docker-compose up -d dynamodb-local
   ```

## 📚 Additional Resources

- **AWS DynamoDB Pricing**: https://aws.amazon.com/dynamodb/pricing/
- **AWS Free Tier**: https://aws.amazon.com/free/
- **DynamoDB Developer Guide**: https://docs.aws.amazon.com/dynamodb/

---

**Need help?** Check the script output for detailed error messages!
