service postgresql start
gt auth --token $GITHUB_TOKEN 
cd backend && make configure-aws && make set-dot-env