pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Setup Node from .nvmrc') {
      steps {
        sh '''
          set -e
          export NVM_DIR="$HOME/.nvm"

          if [ ! -s "$NVM_DIR/nvm.sh" ]; then
            curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
          fi

          . "$NVM_DIR/nvm.sh"

          NODE_VERSION="$(cat .nvmrc)"
          nvm install "$NODE_VERSION"
          nvm use "$NODE_VERSION"

          {
            echo 'export NVM_DIR="$HOME/.nvm"'
            echo '. "$NVM_DIR/nvm.sh"'
            echo "nvm use \"$NODE_VERSION\" >/dev/null"
          } > .jenkins-node-env

          node -v
          npm -v
        '''
      }
    }

    stage('Node Version Check') {
      steps {
        sh '''
          . ./.jenkins-node-env

          REQUIRED="v$(cat .nvmrc)"
          ACTUAL="$(node -v)"
          echo "Required Node: $REQUIRED"
          echo "Actual Node:   $ACTUAL"
          [ "$ACTUAL" = "$REQUIRED" ] || {
            echo "Node version mismatch. Update Jenkins agent Node to $REQUIRED"
            exit 1
          }
          npm -v
        '''
      }
    }

    stage('Install') {
      steps {
        sh '''
          . ./.jenkins-node-env
          npm ci
          npx playwright install chromium
        '''
      }
    }

    stage('Lint') {
      steps {
        sh '''
          . ./.jenkins-node-env
          npm run lint
        '''
      }
    }

    stage('Build + Analyze') {
      steps {
        sh '''
          . ./.jenkins-node-env
          npm run analyze
        '''
      }
    }

    stage('Bundle Budget Gate') {
      steps {
        sh '''
          . ./.jenkins-node-env
          npm run budget:bundle
        '''
      }
    }

    stage('E2E') {
      steps {
        sh '''
          . ./.jenkins-node-env
          npm run test:e2e:ci
        '''
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
