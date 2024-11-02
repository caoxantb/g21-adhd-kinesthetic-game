<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { COLOR_PRIMARY } from "@/constants/";

const router = useRouter();
const auth = useAuthStore();

// type: 0 login 1 sign up
const type = ref(0);

const loginForm = reactive({
  username: "",
  password: "",
});
const loginFormRef = ref();
const loginFormRules = reactive({
  username: [
    {
      required: true,
      whitespace: true,
      message: "Please input username",
      trigger: "blur",
      transform(value) {
        return value.trim();
      },
    },
  ],
  password: [
    {
      required: true,
      whitespace: true,
      message: "Please input password",
      trigger: "blur",
      transform(value) {
        return value.trim();
      },
    },
  ],
});

const signUpFormRef = ref();
const signUpForm = reactive({
  name: "",
  age: null,
  username: "",
  password: "",
  confirmPassword: "",
});
const signUpFormRules = reactive({
  name: [
    {
      required: true,
      whitespace: true,
      message: "Please input name",
      trigger: "blur",
      transform(value) {
        return value.trim();
      },
    },
  ],
  age: [
    {
      type: "number",
      message: "Please input number",
      trigger: "change",
    },
  ],
  username: [
    {
      required: true,
      whitespace: true,
      message: "Please input username",
      trigger: "blur",
      transform(value) {
        return value.trim();
      },
    },
  ],
  password: [
    {
      required: true,
      whitespace: true,
      message: "Please input password",
      trigger: "blur",
      transform(value) {
        return value.trim();
      },
    },
    {
      min: 9,
      message: "Length should be at least 9",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    {
      validator(rule, value) {
        return value === signUpForm.password;
      },
      message: "Passwords do not match",
    },
  ],
});

function login() {
  loginFormRef.value.validate(async valid => {
    if (valid) {
      try {
        await auth.login({
          username: loginForm.username,
          password: loginForm.password,
        });

        router.push("/");
      } catch (err) {}
    }
  });
}

function signUp() {
  signUpFormRef.value.validate(async valid => {
    if (valid) {
      try {
        await auth.register({
          name: signUpForm.name,
          username: signUpForm.username,
          password: signUpForm.password,
          age: signUpForm.age,
        });
        router.push("/");
      } catch (err) {}
    }
  });
}
</script>

<template>
  <div class="container">
    <div class="logo">Game Logo</div>
    <div class="main" v-if="type == 0">
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        label-width="auto"
        label-position="top"
        :rules="loginFormRules"
        @submit.prevent
      >
        <el-form-item label="Username" prop="username" required>
          <el-input
            v-model="loginForm.username"
            placeholder="Enter username"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="Password" prop="password" required>
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="Enter password"
            autocomplete="off"
          />
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
      <el-form
        ref="signUpFormRef"
        :model="signUpForm"
        label-width="auto"
        label-position="top"
        :rules="signUpFormRules"
        @submit.prevent
      >
        <el-form-item label="Player Name" prop="name" required>
          <el-input
            v-model="signUpForm.name"
            placeholder="Enter name of player"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="Age" prop="age">
          <el-input
            v-model.number="signUpForm.age"
            placeholder="Enter age of player"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="Username" prop="username" required>
          <el-input
            v-model="signUpForm.username"
            placeholder="Enter username"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="Password" prop="password" required>
          <el-input
            type="password"
            v-model="signUpForm.password"
            placeholder="Enter password"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="Confirm Password" prop="confirmPassword" required>
          <el-input
            type="password"
            v-model="signUpForm.confirmPassword"
            placeholder="Confirm Password"
            autocomplete="off"
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
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
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
