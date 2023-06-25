const swaggerAutogen = require("swagger-autogen");


const endpointsFiles = {
  users: "./routes/users/userRoute.js",
  admin: "./routes/users/adminRoute.js",
  super_admin: "./routes/users/supperAdminRoute.js",
  auth: "./routes/authRoutes.js",
};

const outputFile = "./docs/swagger-output.json";


// for each file generate swagger docs and than extract path field and convert it to yaml and then delete generated json file
// do it separately for each endpoint file
const generateSwaggerDocs = async () => {
    for (const [name, routefile] of Object.entries(endpointsFiles)) {
        console.log(routefile, outputFile);
        await swaggerAutogen()(outputFile, [routefile]);
        const fs = require("fs");
        const rawdata = fs.readFileSync(outputFile);
        const s = JSON.parse(rawdata);
        // to all request add tag name
        for (const [key, value] of Object.entries(s.paths)) {
            for (const [method, data] of Object.entries(value)) {
                data.tags = [name];
            }
        }
        const jsYaml = require("js-yaml");
        const yamlData = jsYaml.dump(s.paths);
        // save to swagger2.yaml
        fs.writeFileSync(`./docs/${name}.yaml`, yamlData);
        fs.unlinkSync(outputFile);
    }
}
generateSwaggerDocs();

