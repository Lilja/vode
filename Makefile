list:
	unzip -l 909707677.zip | less
run-example:
	[ -d 909707677 ] && rm -r 909707677 || echo "no delet";
	[ -f 909707677.zip ] && rm 909707677.zip || echo "no delet";
	# [ -f /e/xd/nymn/909707677.zip ] && rm -r /e/xd/nymn/909707677.zip || echo "no delet";
	# && cp 62300805.zip /E/xd/nymn/62300805.zip
	yarn run extract --channel nymn --video-id 909707677

curl:
	curl -H "Accept: application/vnd.twitchtv.v5+json" -H "Client-ID: 37v97169hnj8kaoq8fs3hzz8v6jezdj" https://api.twitch.tv/kraken/videos/909707677

greppy:
	grep -C 100 -n 'aab32' ~/code/vode5/extractScript/909707677/909707677-pretty.json