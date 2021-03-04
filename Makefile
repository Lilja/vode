list:
	unzip -l 909707677.zip | less
run-example:
	[ -f 909707677.zip ] && rm 909707677.zip || echo "no delet";
	[ -f 909707677.json ] && rm 909707677.json || echo "no delet";
	[ -f /e/xd/nymn/909707677.zip ] && rm -r /e/xd/nymn/909707677.zip || echo "no delet";
	[ -f /e/xd/nymn/909707677.json ] && rm -r /e/xd/nymn/909707677.json || echo "no delet";
	yarn run extract --channel nymn --video-id 909707677
	cp 909707677.zip /E/xd/nymn/909707677.zip
	cp 909707677.json /E/xd/nymn/909707677.json

greppy:
	grep -C 100 -n 'aab32' ~/code/vode5/extractScript/909707677/909707677-pretty.json
