#!/bin/bash

vim src/* examples/*.js tests/* \
  "+bot vnew +setlocal\ buftype=nofile" \
  "+abo new" \
  "+b tests/server.test.js" \
  "+resize +10"
