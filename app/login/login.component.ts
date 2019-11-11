import { Component, ElementRef, ViewChild } from "@angular/core";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";

import { User } from "../shared/user.model";
import { UserService } from "../shared/user.service";

@Component({
    selector: "app-login",
    moduleId: module.id,
    templateUrl: "./login.component.html",
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    isLoggingIn = true;
    user: User;
    processing = false;
    @ViewChild("password", {static: false}) password: ElementRef;
    @ViewChild("confirmPassword", {static: false}) confirmPassword: ElementRef;

    constructor(private page: Page, private userService: UserService, private routerExtensions: RouterExtensions) {
        this.page.actionBarHidden = true;
        this.user = new User();
        this.user.email = "user@contmatic.com.br";
        this.user.password = "abcd1234";
    }

    toggleForm() {
        this.isLoggingIn = !this.isLoggingIn;
    }

    submit() {
        if (!this.user.email || !this.user.password) {
            this.alert("Insira um endereço de e-mail e uma senha.");
            return;
        }

        this.processing = true;
        if (this.isLoggingIn) {
            this.login();
        } else {
            this.register();
        }
    }

    login() {
        this.userService.login(this.user)
            .then(() => {
                this.processing = false;
                this.routerExtensions.navigate(["/home"], { clearHistory: true });
            })
            .catch(() => {
                this.processing = false;
                this.alert("Conta não encontrada.");
            });
    }

    register() {
        if (this.user.password != this.user.confirmPassword) {
            this.alert("As senhas digitadas não são iguais.");
            this.delay(3000).then(any=>{
                this.processing = false;
            });
            return;
        }
        this.userService.register(this.user)
            .then(() => {
                this.processing = false;
                this.alert("Sua conta foi criada com sucesso.");
                this.isLoggingIn = true;
            })
            .catch(() => {
                this.processing = false;
                this.alert("Infelizmente não pudemos criar sua conta. :(");
            });
    }

    forgotPassword() {
        prompt({
            title: "Esqueci a senha",
            message: "Digite o endereço de e-mail utilizado no cadastro no app da Contmatic.",
            inputType: "email",
            defaultText: "",
            okButtonText: "OK",
            cancelButtonText: "Cancel"
        }).then((data) => {
            if (data.result) {
                this.userService.resetPassword(data.text.trim())
                    .then(() => {
                        this.alert("Sua senha foi alterada com sucesso. Cheque seu e-mail para verificar algumas instruções.");
                    }).catch(() => {
                        this.alert("Um erro ocorreu. Não foi possível redefinir a sua senha.");
                    });
            }
        });
    }

    focusPassword() {
        this.password.nativeElement.focus();
    }
    focusConfirmPassword() {
        if (!this.isLoggingIn) {
            this.confirmPassword.nativeElement.focus();
        }
    }

    alert(message: string) {
        return alert({
            title: "CONTMATIC",
            okButtonText: "OK",
            message: message
        });
    }

    async delay(millis: number) {
        await new Promise(resolve => setTimeout(()=>resolve(), millis)).then(()=>console.log(millis/1000 + " segundo(s) aguardado(s)"));
    }
}

