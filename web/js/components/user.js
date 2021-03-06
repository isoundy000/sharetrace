//注册
var Register = function (resolve, reject) {
    var template_url = 'components/register.html';
    return fetch(template_url)
        .then(function (template_resp) {
            return template_resp.text();
        }).then(function (template) {
            resolve({
                template: template,
                data: function () {
                    return {
                        name: null,
                        pass_code: null,
                        test_pass_code: null,
                        message: null,
                        email: null,
                        email_error: null,
                        icon: null
                    };
                },
                methods: {
                    init_user: function () {
                        if (is.not.existy(this.pass_code) || this.pass_code.length < 6) {
                            this.message = '密码长度小于6个字符，请重新输入。';
                        } else {
                            if (this.test_pass_code != this.pass_code) {
                                this.message = '两次输入密码不一致，请重新输入。';
                            } else {
                                var testEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                                if (!testEmail.test(this.email)) {
                                    this.email_error = '邮箱格式有误！！！';
                                } else {
                                    fetch('/op/user/init', {
                                        method: 'post',
                                        body: JSON.stringify({
                                            "name": this.name,
                                            "passwd": this.pass_code,
                                            "email":this.email 
                                        }),
                                        credentials: 'same-origin'
                                    }).then(function (response) {
                                        return response.json();
                                    }).then(function (data) {
                                        if (data.status == true) {
                                            router.go("/login");
                                        }else{
                                        	alert(data.msg);
                                        }
                                    });
                                }
                            }
                        }
                    },
                }
            });
        });
};

//登录
var Login = function (resolve, reject) {
    var template_url = 'components/login.html';
    return fetch(template_url)
        .then(function (template_resp) {
            return template_resp.text();
        }).then(function (template) {
            resolve({
                template: template,
                data: function () {
                    return {
                        name: null,
                        pass_code: null,
                        username_error: null,
                        user_password_error: null
                    };
                },
                methods: {
                    login: function () {
                        var vm = this;
                        fetch('/op/login', {
                            method: 'post',
                            body: JSON.stringify({
                                "email": this.email,
                                "passwd": this.pass_code
                            }),
                            credentials: 'same-origin'
                        }).then(function (response) {
                            return response.json();
                        }).then(function (data) {
                            if (data.status == true) {
                                index = 2;
                                user_auth_ok = true;
                                user_info = data["data"];
                                router.app.user_info = user_info;
                                router.app.useremail = user_info["email"];
                                $.cookie("useremail", user_info["email"],{path: '/', expires: 604800});
                                //TODO if admin go to users, else go to apps
                                router.go("/apps");
                            } else {
                                alert(data.msg);
                            }
                        });
                    }
                }
            });
        });
};

//用户列表
var Users = function (resolve, reject) {
    var template_url = 'components/users.html';
    return fetch(template_url)
        .then(function (template_resp) {
            return template_resp.text();
        }).then(function (template) {
            resolve({
                template: template,
                route: {
                    data: function (transition) {
                        var page = transition.to.params.page;
                        return fetch('/op/users/' + page + '/' + COUNT_PER_PAGE, { credentials: 'same-origin' })
                            .then(function (data_resp) {
                                return data_resp.json();
                            }).then(function (data) {
                                if (data.data!= null) {
                                    var u = null;
                                    for (i in data.data) {
                                        u = data.data[i];
                                    }
                                }
                                var page_count = 0;
                                if (data.data.total_count % COUNT_PER_PAGE == 0) {
                                    page_count = data.total/ COUNT_PER_PAGE;
                                } else {
                                    page_count = Math.floor(data.total/ COUNT_PER_PAGE) + 1;
                                }
                                return {
                                    data: data.data,
                                    password_error: '',
                                    email_error: '',
                                    username_already_exists_error: '',
                                    name: '',
                                    pass_code: '',
                                    confirm_pass_code: '',
                                    email: '',
                                    icon: '',
                                    aux_info: u.aux_info,
                                    page_count: page_count,
                                    user: null,
                                };
                            });
                    }
                },
                methods: {
                    //保存p数据
                    save_data: function () {
                        var vm = this;
                        if (vm.judge_value == 2) {
                            //修改APP
                            fetch('/op/user', {
                                method: 'PUT',
                                body: JSON.stringify({
                                    "id": vm.user.id,
                                    "email": vm.user.email,
                                    "name": vm.user.name,
                                    "passwd": vm.user.passwd,
                                }),
                                credentials: 'same-origin'
                            }).then(function (response) {
                                return response.json();
                            }).then(function (data) {
                                if (data.status == true) {
                                    $('#myModal').modal('hide');
                                } else {
                                	alert(data.msg);
                                }
                            });
                        }
                    },
                    show_edit_user: function(user) {
                        this.err_msg = null;
                        this.judge_value = 2;
                        this.user= clone(user);
                        this.modal_title = '修改';
                        this.operater = '保存';
                    },
                }
            });
        });
};
