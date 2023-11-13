
async function main() {
	const fs = require('fs')


	fs.writeFile('output.txt', "test", (err) => {
	 if (err) throw err;
	});
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
