<template>
    <div class="login_container">
        
        <div class="login_box">
            <!--头像区-->
            <div class="avatar_box">
                <img src="../assets/logo.png">
            </div>
            <!--登录表单区-->
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
                <!--用户名-->
                <el-form-item prop="username">
                <el-input v-model="loginForm.username"  prefix-icon="el-icon-user-solid"></el-input>
                </el-form-item>
                <!--密码-->
                <el-form-item prop="password">
                <el-input v-model="loginForm.password"  prefix-icon="el-icon-lock" type="password"></el-input>
                </el-form-item>
                <!--按钮区域-->
                <el-form-item class="btns">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="resetLoginFormRef">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>


</template>

<script>
export default {
    data(){
        return{
            //这是登录表单的数据绑定对象
            loginForm:{
                username:'admin',
                password:'123456'
            },
            //这里验证表单规则
            loginFormRules:{
                //验证用户名是否合法
                username:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                //验证密码是否合法
                password:[
                   { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods:{
        //点击重置按钮，重置登录表单
        resetLoginFormRef(){
           // console.log(this)
           this.$refs.loginFormRef.resetFields();
        },
        login(){
            this.$refs.loginFormRef.validate(async valid=>{
                //console.log(valid);
                //预验证后是否发起登录请求
                if(!valid) return;
                //const result=await this.$http.post("login",this.loginForm); //await 减缓前台返回的promise
                const {data:res}=await this.$http.post("login",this.loginForm); //await 减缓前台返回的promise
                //console.log(res);
                if(res.meta.status!=200) return this.$message.error('登录失败'); //console.log('登录失败！')
                this.$message.success('登录成功！');
                console.log(res);
                //登录成功将token保存daostorage
                window.sessionStorage.setItem('token',res.data.token);
                this.$router.push('/home');
                //console.log('登录成功!');
            });
        }
    }
}
</script>

<style lang="less" scoped>
.login_container
{
background-color: #2b4b6b;
height: 100%;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    .avatar_box{
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        background-color: #fff;
        img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }

    }
}
.btns{
    display: flex;
    justify-content: flex-end;
}
.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

</style>