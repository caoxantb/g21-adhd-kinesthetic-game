<script setup>
import { reactive, ref } from "vue";
import { COLOR_PRIMARY } from "@/constants/";

// type: 0 login 1 sign up
const type = ref(0);
const loginForm = reactive({
  username: "",
  password: "",
});

const signUpForm = reactive({
  playerName: "",
  age: null,
  username: "",
  password: "",
  confirmPassword: "",
});

function login() {}
function signUp() {}
</script>

<template>
  <div class="container">
    <div class="logo">Game Logo</div>
    <div class="main" v-if="type == 0">
      <el-form label-width="auto" label-position="top">
        <el-form-item label="Username">
          <el-input v-model="loginForm.username" placeholder="Enter username" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="loginForm.password" placeholder="Enter password" />
        </el-form-item>
        <el-form-item>
          <el-button
            size="large"
            :color="COLOR_PRIMARY"
            class="button-large"
            @click="login"
            >Login</el-button
          >
        </el-form-item>
      </el-form>
      <div class="text">
        Not a member? <span class="link" @click="type = 1">Sign up now</span>
      </div>
    </div>
    <div class="main" v-else>
      <el-form label-width="auto" label-position="top">
        <el-form-item label="Player Name">
          <el-input
            v-model="signUpForm.playerName"
            placeholder="Enter name of player"
          />
        </el-form-item>
        <el-form-item label="Age">
          <el-input
            v-model="signUpForm.age"
            placeholder="Enter age of player"
          />
        </el-form-item>
        <el-form-item label="Username">
          <el-input
            v-model="signUpForm.username"
            placeholder="Enter username"
          />
        </el-form-item>
        <el-form-item label="Password">
          <el-input
            v-model="signUpForm.password"
            placeholder="Enter password"
          />
        </el-form-item>
        <el-form-item label="Confirm Password">
          <el-input
            v-model="signUpForm.confirmPassword"
            placeholder="Confirm Password"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            size="large"
            :color="COLOR_PRIMARY"
            class="button-large"
            @click="signUp"
            >Sign Up</el-button
          >
        </el-form-item>
      </el-form>
      <div class="text">
        Already a member? <span class="link" @click="type = 0">Login now</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 365px;
  max-width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.logo {
  font-size: 36px;
  margin-bottom: 10px;
}

.main {
  background-color: var(--color-white);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
}

.button-large {
  width: 100%;
  height: 57px !important;
  margin-top: 20px;
}

.text {
  text-align: center;
}

.link {
  text-decoration: underline;
  text-underline-offset: 5px;
  cursor: pointer;
  color: var(--color-dark-blue);
}

.link:hover {
  opacity: 0.7;
}
</style>
