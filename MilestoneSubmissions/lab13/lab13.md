Dns name:
recitation-15-team-06.eastus2.cloudapp.azure.com
Also make sure private key is read only, so on unix based systems run:
chmod 400 csci3308_key.pem
ssh command:
ssh -i csci3308_key.pem azureuser@recitation-15-team-06.eastus2.cloudapp.azure.com
access the website from public url: http://recitation-15-team-06.eastus2.cloudapp.azure.com:3000/


