const appName = "Demo Node App";
const version = "1.0.0";

function greet(name) {
    return `Hello ${name}, welcome to CI/CD with Jenkins!`;
}

console.log(`Starting ${appName} v${version}...`);
console.log(greet("Developer"));
