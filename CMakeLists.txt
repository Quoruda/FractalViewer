cmake_minimum_required(VERSION 3.0.0)
project(HelloWorld VERSION 1.0.0)

set(CMAKE_FIND_PACKAGE_FIRMWARE FALSE)
set(OpenGl_DIR /usr/lib/x86_64-linux-gnu/OpenGL)
find_package(OpenGl REQUIRED)

add_executable(hello_window 
    src/config.h 
    src/main.cpp 
    src/glad.c
)

target_include_directories(hello_window PRIVATE dependencies)

target_link_libraries(hello_window glfw OpenGL::GL)