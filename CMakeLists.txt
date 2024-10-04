cmake_minimum_required(VERSION 3.0)
project(HelloWorld VERSION)

find_package(OpenGL REQUIRED)

add_executable(hello_world 
    src/config.h 
    src/main.cpp 
    src/glad.c
    src/triangle_mesh.h
    src/triangle_mesh.cpp
    )

target_link_libraries(hello_world glfw OpenGL::GL)