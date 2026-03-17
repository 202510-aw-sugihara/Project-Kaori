@echo off
setlocal

:: -----------------------------------------------------------------------------
:: Maven Wrapper
::
:: Licensed to the Apache Software Foundation (ASF) under one or more
:: contributor license agreements. See the NOTICE file distributed with
:: this work for additional information regarding copyright ownership.
:: The ASF licenses this file to You under the Apache License, Version 2.0
:: (the "License"); you may not use this file except in compliance with
:: the License. You may obtain a copy of the License at
::
::     https://www.apache.org/licenses/LICENSE-2.0
::
:: Unless required by applicable law or agreed to in writing, software
:: distributed under the License is distributed on an "AS IS" BASIS,
:: WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
:: See the License for the specific language governing permissions and
:: limitations under the License.
:: -----------------------------------------------------------------------------

set MAVEN_WRAPPER_DIR=%~dp0\.mvn\wrapper
set MAVEN_WRAPPER_JAR=%MAVEN_WRAPPER_DIR%\maven-wrapper.jar

if not exist "%MAVEN_WRAPPER_JAR%" (
  echo The Maven Wrapper JAR is missing. Please run "mvn -N io.takari:maven:wrapper" to regenerate it.
  exit /b 1
)

java -cp "%MAVEN_WRAPPER_JAR%" -Dmaven.multiModuleProjectDirectory="%~dp0." org.apache.maven.wrapper.MavenWrapperMain %*
