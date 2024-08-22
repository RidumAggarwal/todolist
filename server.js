const fs = require('fs');
const http = require('http');

let found = false;
let uemail;
let username;
http.createServer((req, res) => {
    console.log(req.method, req.url);
    if (req.method === 'GET' && req.url == "/") {
        found = false;
        let data = fs.readFileSync("./index.html", 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
        return;
    }
    if (req.url == "/logo") {
        fs.readFile("user.png", (err, image) => {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(image);
        });
        return;
    }

    if (req.method === 'GET' && req.url == "/todo" && found) {
        let data1 = fs.readFileSync("./todo.html", 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data1);
        return;
    }
    if (req.method === 'POST' && req.url === "/tasks") {
        let temp = "";
        let userFound = false;
        let allusers = [];

        req.on('data', (chunk) => {
            temp += chunk;
        });

        req.on('end', () => {
            temp = JSON.parse(temp);
            console.log(temp);

            fs.readFile("./tasks.txt", 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    if (data) {
                        allusers = JSON.parse(data);
                    }

                    allusers.forEach((user) => {
                        if (temp.email === user.email) {
                            user.tasks = temp.tasks;
                            userFound = true;
                            console.log(user);
                        }
                    });

                    if (!userFound) {
                        allusers.push(temp);
                    }

                    fs.writeFile("./tasks.txt", JSON.stringify(allusers), (err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("success");
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end("success");
                        }
                    });
                }
            });
        });
    }
    if (req.method === 'GET' && req.url == "/tasks") {
        let tasks = fs.readFileSync("./tasks.txt", 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(tasks);
    }

    if (req.method === 'POST' && req.url == "/submit") {
        let temp = "";
        req.on("data", (chunk) => {
            temp += chunk.toString();
        })
        req.on("end", () => {
            temp = JSON.parse(temp);
            fs.readFile("./file.txt", "utf-8", (err, data) => {
                if (err) {
                    console.log(err);
                    res.end("Error: Unable to read file");
                } else {
                    if (data == "") {
                        var arr = [];
                        arr.push(temp);
                        fs.writeFile("./file.txt", JSON.stringify(arr), (err) => {
                            if (err) {
                                console.error(err);
                                res.end("Error: Unable to write file");
                            } else {
                                res.end("success");
                            }
                        })
                    } else {
                        flag = 0;
                        data = JSON.parse(data);
                        data.forEach((elm) => {
                            if (elm.email === temp.email) {
                                flag = 1;
                                username = elm.name;
                                uemail = elm.email;
                            }
                        })
                        if (flag == 0) {
                            data.push(temp);
                            fs.writeFile("./file.txt", JSON.stringify(data), (err) => {
                                if (err) {
                                    console.error(err);
                                    res.end("Error: Unable to write file");
                                } else {
                                    res.end("success");
                                }
                            })
                        }
                    }

                }
            })
        })
    }

    if (req.method === 'POST' && req.url == "/login") {
        let loginDetails = "";
        req.on("data", (chunk) => {
            loginDetails += chunk.toString();
        });
        req.on("end", () => {
            loginDetails = JSON.parse(loginDetails);
            fs.readFile("./file.txt", "utf-8", (err, data) => {
                if (err) {
                    console.log(err);
                    res.end("Error: Unable to read file");
                } else {
                    let array = JSON.parse(data);

                    array.forEach(element => {
                        if (element.email === loginDetails.email && element.password === loginDetails.password) {
                            found = true;
                            username = element.name;
                            uemail = element.email;
                        }
                    });
                    if (found) {

                        res.end(`{"status": "Login successful","username": "${username}","email":"${uemail}"}`);
                    } else {
                        res.end(`{"status": "Invalid email or password"}`);
                    }
                }
            });
        });
    }
}).listen(8000, () => {
    console.log("server is running on port 8000");
});