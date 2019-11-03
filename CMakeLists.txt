cmake_minimum_required(VERSION 3.9)
cmake_policy(SET CMP0042 NEW)
set (CMAKE_CXX_STANDARD 11)

project (sourcetraildb)
include_directories(${CMAKE_JS_INC})
file(GLOB SOURCE_FILES "Init.cc" "Writer.h" "Writer.cc")
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

# Include node sources
include(ExternalProject)
ExternalProject_Add(
	node
	URL https://nodejs.org/dist/v12.13.0/node-v12.13.0.tar.gz
	CONFIGURE_COMMAND ""
	BUILD_COMMAND ""
	INSTALL_COMMAND ""
	TEST_COMMAND ""
)
add_dependencies(${PROJECT_NAME} node)
ExternalProject_Get_property(node SOURCE_DIR)
set(NODE_SRC ${SOURCE_DIR}/src)

ExternalProject_Add(
	sourcetraildb-upstream
	URL https://github.com/CoatiSoftware/SourcetrailDB/archive/v2.db24.p0.zip
	CMAKE_ARGS -DBUILD_BINDINGS_PYTHON:BOOL=OFF
			   -DBUILD_EXAMPLES:BOOL=OFF
			   -DCMAKE_BUILD_TYPE_INIT:STRING=RelWithDebInfo
			   -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
	INSTALL_COMMAND ""
	TEST_COMMAND ""
)
add_dependencies(${PROJECT_NAME} sourcetraildb-upstream)
ExternalProject_Get_property(sourcetraildb-upstream INSTALL_DIR)
set(SOURCETRAILDB_DIR ${INSTALL_DIR})
message(STATUS "SOURCETRAILDB_DIR set to " ${SOURCETRAILDB_DIR})
set(SOURCETRAILDB_INC ${INSTALL_DIR}/src/sourcetraildb-upstream/core/include)
set(SOURCETRAILDB_INC_VERSION_H ${INSTALL_DIR}/src/sourcetraildb-upstream-build/core/include)
set(SOURCETRAILDB_LIB ${INSTALL_DIR}/src/sourcetraildb-upstream-build/core/Release/sourcetraildb.lib)

# Include N-API wrappers
execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )
string(REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_SRC} ${NODE_ADDON_API_DIR} ${SOURCETRAILDB_INC} ${SOURCETRAILDB_INC_VERSION_H})
target_link_directories(${PROJECT_NAME} PRIVATE ${SOURCETRAILDB_LIB})

# define NPI_VERSION
add_definitions(-DNAPI_VERSION=3)
