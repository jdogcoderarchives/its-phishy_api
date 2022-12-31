import swaggerJsdoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "It's Phishy API",
      version: process.env.npm_package_version as string,
      description:
        "Scam Prevention API",
      termsOfService: "https://api.itsfishy.xyz/tos",
      license: {
        name: "Eclipse Public License 2.0 (EPL-2.0)",
        url: "https://opensource.org/licenses/EPL-2.0",
      },
      contact: {
        name: "It's Phishy Project",
        url: "itsphishy.xyz",
        email: "contact@itsfishy.xyz",
      },
    },
    basePath: "/",
    tags: [
      { name: "/", description: "Main API Endpoints" },
      { name: "/auth", description: "Authentication Endpoints" },
    ],
  },
  apis: ["./src/routes/**/*.ts", "./src/models/**/*.ts"],
};

export const apiSpecs = swaggerJsdoc(options);