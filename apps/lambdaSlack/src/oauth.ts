import { APIGatewayProxyHandler } from 'aws-lambda';
import { WebClient } from '@slack/web-api';
import { integrationsService } from '@corpusai/aws-common';

/**
 * Slack OAuth Handler
 * Handles OAuth callback when user installs the bot
 */

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Slack OAuth callback received');

  const code = event.queryStringParameters?.code;
  const state = event.queryStringParameters?.state; // Contains chatbotId

  if (!code) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Error: No authorization code provided</h1>',
    };
  }

  if (!state) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Error: No chatbot ID provided</h1>',
    };
  }

  try {
    // Exchange code for access token
    const client = new WebClient();
    const result = await client.oauth.v2.access({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code,
    });

    if (!result.ok) {
      throw new Error('Failed to exchange OAuth code');
    }

    // Extract integration details
    const {
      access_token,
      team,
      bot_user_id,
      app_id,
      authed_user,
    } = result as any;

    const workspaceId = team.id;
    const workspaceName = team.name;
    const botToken = access_token;

    console.log('Slack OAuth successful:', {
      workspaceId,
      workspaceName,
      chatbotId: state,
    });

    // Store integration in DynamoDB
    await integrationsService.entities.slackIntegration.put({
      chatbotId: state,
      workspaceId,
      workspaceName,
      token: botToken,
      botUserId: bot_user_id,
      appId: app_id,
      installedBy: authed_user?.id || '',
      installedAt: new Date().toISOString(),
    }).go();

    console.log('Slack integration stored successfully');

    // Return success page
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Slack Integration Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              background: white;
              padding: 3rem;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            h1 {
              color: #2eb886;
              margin-bottom: 1rem;
            }
            p {
              color: #666;
              line-height: 1.6;
            }
            .success-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Slack Integration Successful!</h1>
            <p>Your chatbot has been successfully connected to workspace <strong>${workspaceName}</strong>.</p>
            <p>You can now @mention the bot in any channel where it's installed.</p>
            <p style="margin-top: 2rem; color: #999; font-size: 0.9rem;">
              You can close this window.
            </p>
          </div>
        </body>
        </html>
      `,
    };
  } catch (error: any) {
    console.error('Error during Slack OAuth:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Slack Integration Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              background: white;
              padding: 3rem;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            h1 {
              color: #e01e5a;
              margin-bottom: 1rem;
            }
            p {
              color: #666;
              line-height: 1.6;
            }
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">❌</div>
            <h1>Slack Integration Failed</h1>
            <p>An error occurred while connecting your chatbot to Slack:</p>
            <p style="color: #e01e5a;"><strong>${error.message}</strong></p>
            <p style="margin-top: 2rem;">Please try again or contact support.</p>
          </div>
        </body>
        </html>
      `,
    };
  }
};
