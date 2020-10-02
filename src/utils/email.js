const nodeMailer =  require(`nodemailer`)
const htmlToText = require('html-to-text')
const pug = require('pug')
const SgTransport = require('nodemailer-sendgrid-transport')
const sgMail = require('@sendgrid/mail')

module.exports = class Email {
    constructor(user, url){
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url,
        this.from = 'Ali Raza <alirazapu43@gmail.com>'
        sgMail.setApiKey('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')


    }

    newTransport(){

            return nodeMailer.createTransport(SgTransport({
                service: 'SendGrid',
                auth : {
                    user : 'apikey',
                    password : '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'
                }
            }))


        return nodeMailer.createTransport({
            // service  : `Gmail`,
            host : `smtp.mailtrap.io`,
            port : `25 or 465 or 587 or 2525`,
            auth  :{
                user  : `be4b53a5bd73cd`,
                pass : `ab77021e974f99`
            }
        })
    }

   send(template, subject){
        const html = pug.renderFile(`${__dirname}/../../views/email/${template}.pug`,{
            firstName : this.firstName,
            url : this.url,
            subject
        })
        const  mailOption = {
            from : this.from,
            to : this.to,
            subject,
            html,
            text : htmlToText.fromString(html)
        }
        sgMail.send(mailOption)
    //    await this.newTransport().sendMail(mailOption)
        // await transporter.sendMail(mailOption)
    }

sendWelcome(){
    this.send('welcome', 'Welcome to the Natours family!')
    }

    sendPasswordReset(){
     this.send('passwordReset', 'your password reset token only valid for 1 minute')
    }
}

// const sendEmail = async options =>{
//     //create transporter
//     // const transporter = nodeMailer.createTransport({
//     //     // service  : `Gmail`,
//     //     host : `smtp.mailtrap.io`,
//     //     port : `25 or 465 or 587 or 2525`,
//     //     auth  :{
//     //         user  : `be4b53a5bd73cd`,
//     //         pass : `ab77021e974f99`
//     //     }
//     // })
//     //deffine email option
//     const  mailOption = {
//         from : `Ali Raza<alirazapu43@gmail.com`,
//         to : options.email,
//         subject : options.subject,
//         text : options.message
//     }
//     //actually send the email
//    await transporter.sendMail(mailOption)
// }

// module.exports  = sendEmail