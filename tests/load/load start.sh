for ((i=1; i<=10000; i++)); do
  port=$((RANDOM % 20 + 3000))  # Generates a random number between 3000 and 3019
  curl --location "http://localhost:$port/courses" \
  --header 'Content-Type: application/json' \
  --data '{
      "tenantId": "0192791f-fd3b-7eef-a981-8c3987c01a2c",
      "title": "titulo",
      "description": "teste 2"
  }' &

  # Every 100 requests, wait for all background jobs to finish
  if (( i % 500 == 0 )); then
    wait  # Waits for all background processes to finish
  fi
done

# Wait for any remaining background jobs to finish
wait

/// 3000 to 3019
yarn dev 3000 &
yarn dev 3001 &
yarn dev 3002 &
yarn dev 3003 &
yarn dev 3004 &
yarn dev 3005 &
yarn dev 3006 &
yarn dev 3007 &
yarn dev 3008 &
yarn dev 3009 &
yarn dev 3010 &
yarn dev 3011 &
yarn dev 3012 &
yarn dev 3013 &
yarn dev 3014 &
yarn dev 3015 &
yarn dev 3016 &
yarn dev 3017 &
yarn dev 3018 &
yarn dev 3019 &