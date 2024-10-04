#include "config.h"
#include "triangle_mesh.h"

unsigned int make_shaders(const std::string& vertexPath, const std::string& fragmentPath);

unsigned int make_module(const std::string& filepath, unsigned int module_type);

int main() {
    std::cout << "Hello, World!" << std::endl;

    GLFWwindow* window;

    if(!glfwInit()) {
        return -1;
    }

    window = glfwCreateWindow(640, 480, "Hello, World!", NULL, NULL);
    glfwMakeContextCurrent(window);

    if(!gladLoadGLLoader((GLADloadproc) glfwGetProcAddress)) {
        glfwTerminate();
        return -1;
    }

    glClearColor(0.75f, 0.5f, 0.75f, 1.0f);

    TriangleMesh* triangle = new TriangleMesh();

    unsigned int shader = make_shaders("../src/shaders/vertex.vert", "../src/shaders/fragment.frag");

    while (!glfwWindowShouldClose(window))
    {
        glfwPollEvents();

        glClear(GL_COLOR_BUFFER_BIT);

        glUseProgram(shader);
        triangle->draw();


        glfwSwapBuffers(window);
    }

    glDeleteProgram(shader);
    
    glfwTerminate();

    return 0;
}

unsigned int make_shaders(const std::string& vertexPath, const std::string& fragmentPath){
    std::vector<unsigned int> modules;
    modules.push_back(make_module(vertexPath, GL_VERTEX_SHADER));
    modules.push_back(make_module(fragmentPath, GL_FRAGMENT_SHADER));

    unsigned int shader = glCreateProgram();
    for(unsigned int module : modules) {
        glAttachShader(shader, module);
    }
    glLinkProgram(shader);

    int success;
    glGetProgramiv(shader, GL_LINK_STATUS, &success);
    if(!success) {
        char infoLog[1024];
        glGetProgramInfoLog(shader, 1024, NULL, infoLog);
        std::cout << "ERROR::SHADER::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
    }

    for(unsigned int module : modules) {
        glDeleteShader(module);
    }

    return shader;

}

unsigned int make_module(const std::string& filepath, unsigned int module_type) {
      
    std::ifstream file;
    std::string line;
    std::stringstream bufferedLines;

    file.open(filepath);
    while(std::getline(file, line)) {
        bufferedLines << line << "\n";
    }
    std::string shaderSource = bufferedLines.str();
    const char* shaderSourceC = shaderSource.c_str();
    bufferedLines.str("");
    file.close();

    unsigned int module = glCreateShader(module_type);
    glShaderSource(module, 1, &shaderSourceC, NULL);
    glCompileShader(module);

    int success;
    glGetShaderiv(module, GL_COMPILE_STATUS, &success);
    if(!success) {
        char infoLog[1024];
        glGetShaderInfoLog(module, 1024, NULL, infoLog);
        std::cout << "ERROR::SHADER::COMPILATION_FAILED\n" << infoLog << std::endl;
    }

    return module;

}