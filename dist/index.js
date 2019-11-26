"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = __importStar(require("nodemailer"));
const Mustache = __importStar(require("mustache"));
const sap_cf_destconn_1 = require("sap-cf-destconn");
;
class SapCfMailer {
    constructor(destinationName) {
        this.destinationPromise = sap_cf_destconn_1.readDestination(destinationName || "MAIL");
    }
    getTransporter() {
        return __awaiter(this, void 0, void 0, function* () {
            const { destinationConfiguration } = yield this.destinationPromise;
            if (!destinationConfiguration["mail.smtp"]) {
                throw (`No SMTP address found in the mail destination. Please define a 'mail.smtp' property in your destination`);
            }
            // create reusable transporter object using the default SMTP transport
            return nodemailer.createTransport({
                host: destinationConfiguration["mail.smtp"],
                port: parseInt(destinationConfiguration["mail.port"] || "587") || 587,
                secure: false,
                auth: {
                    user: destinationConfiguration["mail.user"],
                    pass: destinationConfiguration["mail.password"] // generated ethereal password
                }
            });
        });
    }
    sendMail(mailOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = yield this.getTransporter();
            const { destinationConfiguration } = yield this.destinationPromise;
            if (!mailOptions.from) {
                mailOptions.from = destinationConfiguration["mail.from"] || destinationConfiguration["mail.user"];
            }
            return transporter.sendMail(mailOptions);
        });
    }
    sendMailTemplate(mailOptionsIn, mailValues) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = Object.assign({}, mailOptionsIn);
            if (mailOptions.html) {
                const HtmlTemplate = Mustache.parse(mailOptions.html.toString());
                mailOptions.html = Mustache.render(HtmlTemplate, mailValues);
            }
            if (mailOptions.text) {
                const TextTemplate = Mustache.parse(mailOptions.text.toString());
                mailOptions.text = Mustache.render(TextTemplate, mailValues);
            }
            return this.sendMail(mailOptions);
        });
    }
}
exports.default = SapCfMailer;