import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "./envHandler";

export type Secrets = {
  email_verification_token_secret: string;
  email_verification_username: string;
  active_session_token_secret: string;
  password_reset_session_token_secret: string;
  google_email_oauth_client_id: string;
  google_email_oauth_client_secret: string;
  google_email_refresh_token: string;
  totp_secret_encryption_key: string;
  totp_temp_token_secret: string;
};

export async function loadSecrets(): Promise<Secrets> {
  const secretName = "AppDice";

  const client = new SecretsManagerClient({
    region: AWS_REGION,

    // This part is required only for local development
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
      VersionStage: "AWSCURRENT",
    })
  );

  if (!response.SecretString) {
    throw new Error("SecretString is empty");
  }
  console.log("Secrets loaded successfully");
  const jsonSecret = JSON.parse(response.SecretString);

  return jsonSecret as Secrets;
}
