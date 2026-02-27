pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  environment {
    CI = 'true'
    NODE_ENV = 'production'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install chromium'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Build + Analyze') {
      steps {
        sh 'npm run analyze'
      }
    }

    stage('Bundle Budget Gate') {
      steps {
        sh 'npm run budget:bundle'
      }
    }

    stage('E2E') {
      steps {
        sh 'npm run test:e2e:ci'
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'test-results/e2e-junit.xml'

      archiveArtifacts artifacts: 'dist/bundle-report.html,dist/bundle-budget-report.json,playwright-report/**,test-results/**', allowEmptyArchive: true
    }
  }
}
