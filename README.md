# Getting Started with Deadline Spotfleet Management Tool

This project introduces the Deadline Spotfleet Management Tool, designed to simplify the formatting of JSON configurations for Deadline through an intuitive form and preview system.

## Available Scripts

### `npm install`

Installs the necessary dependencies for the project.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

***

## Deploying with AWS Amplify

Here are the steps to deploy this project using AWS Amplify:

- **Sign in to AWS Amplify Console**: Go to the [AWS Management Console](https://aws.amazon.com/console/) and sign in to your AWS account.
   
- **Create a New App**: Navigate to the AWS Amplify console and click on "New app" then, click on "Host web app" to start the deployment process.

![New App](public/doc_asset/amplify-new-app.png)

- **Choose Deployment Method**:
   There are two methods for deployment:
   - **GitHub**: Requires admin access to the repository for automatic updates.
   - **Deploy Without Git Provider**: Does not automatically update and requires you to manually deploy changes.

### GitHub Deployment:

- **Connect your repository**: Select 'trackit/Deadline-rfdk-public' repository and then 'feat/spotfleet-mgmt-ui' branch. \
Amplify Hosting requires you to have admin access to this repository.
![Github deploy](public/doc_asset/github-deploy.png)

- **Configure build settings**: Edit build and test settings, you can use the following settings:
```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - cd client
        - npm install
        - npm run build
  artifacts:
    baseDirectory: client/build
    files:
      - '**/*'
  cache:
    paths:
      - client/node_modules/**/*
```
You don't need to modify the advanced settings.

- **Deploy your app**: Once configured, Amplify will automatically build and deploy your app whenever you push changes to your connected repository.

- **View your deployed app**: Once the deployment is complete, you can access your app using the provided URL.

### Deploy Without Git Provider:

- **Compress client folder**: First, you need to compress the client folder into a .zip file..

- **Provide project folder**: You can give an app name and an environment name, then drag and drop the client folder.

![Manual deploy](public/doc_asset/manual-deploy.png)

- **Deploy your app**: Once configured, Amplify will automatically build and deploy your app. However, it will not make any modifications if you push changes to a repository afterward.

- **View your deployed app**: Once the deployment is complete, you can access your app using the provided URL.

## Learn More

You can learn more about deploying React apps with AWS Amplify in the [AWS Amplify documentation](https://docs.amplify.aws/).