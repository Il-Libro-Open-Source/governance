const http = require("https");
const fs = require("fs");
const users = JSON.parse(fs.readFileSync('ambassadors_list.json'));

const get = async (user) => {
    return new Promise((accept, reject) => {
        http.get({
            "host": "api.github.com",
            "port": 443,
            "path": `/users/${user}`,
            "headers": {
                "User-Agent": "request",
                "Authorization": `token ${process.env.API_TOKEN}`,
            },
        }, (res) => {
            let body = "";
            if (res.statusCode != 200) {
                reject(`Got response: ${res.statusCode}`);
                return;
            }
            res.on("data", (d) => (body += d));
            res.on("end", () => {
                const user = JSON.parse(body);
                accept(user);
            });
        }
        );
    });
};
const main = async () => {
    const names = [];

    console.log('Lettura in corso...');
    
    for (const user of users) {
        try {
            const result = await get(user.user);
            const name = result.name ?? result.login;
            const url = result.html_url;
            names.push({ name, url, ...user });
        } catch (e) {
            console.log(e);
        }
    }
    names.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    
    for (const user of names) {
        console.log(`- [${user.name}](${user.url}) - (${user.beginDate} - ${user.endDate ?? "Attualmente in carica"})`);
    }

    console.log(`${names.length} totali`);
};

main();