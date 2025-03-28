docker compose down
rm -rf db_data/
docker compose up -d
clear
sleep 7
npm run dev