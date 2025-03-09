---
title: 'IDEA File Template'
date: 2025/3/9
update_at: 13:58
categories: []
tags: []
cover: null
author: null
published: false
layout: /src/layouts/md.astro
---

## 概述
在文件模板中，您可以使用文本、代码、注释和预定义变量。 下面提供了预定义变量的列表。
当您在模板中使用这些变量时，它们稍后会在编辑器中扩展为相应的值。

您也可以指定自定义变量。 自定义变量使用以下格式：
`${VARIABLE_NAME}`，其中 `VARIABLE_NAME` 是变量的名称（例如，`${MY_CUSTOM_FUNCTION_NAME}`）。
在 IDE 使用自定义变量创建新文件之前，您会看到一个对话框，您可以在其中定义模板中自定义变量的值。

通过使用 `#parse` 指令，您可以包括 `Include` 标签页中的模板。
要包含模板，请在引号中以形参形式指定模板的全名（例如，`#parse("File Header")`）。

## 预定义变量列表
- `${DATE}` 当前系统日期 
- `${DAY}`  当月几号 
- `${DAY_NAME_SHORT}`  当前星期几名称的前 3 个字母（例如，Mon、Tue 等） 
- `${DAY_NAME_FULL}`  当前星期几的全名（Monday、Tuesday 等） 
- `${DIR_PATH}`  新文件的目录路径（相对于项目根目录） 
- `${DS}`  美元符号 ($)。 此变量用于转义美元字符，因此不会将其视为模板变量的前缀。 
- `${FILE_NAME}`  新文件的名称 
- `${HOUR}`  当前小时 
- `${MINUTE}`  当前分钟 
- `${SECOND}`  当前秒 
- `${MONTH}`  当前月份 
- `${MONTH_NAME_SHORT}`  当前月份名称的前 3 个字母（Jan、Feb 等）。 
- `${MONTH_NAME_FULL}`  当前月份的全名（January、February 等）。 
- `${NAME}`  新实体（文件、类型、接口等）的名称 
- `${ORGANIZATION_NAME}`  在项目设置中指定的组织的名称 
- `${PRODUCT_NAME}`  IDE 的名称 
- `${PROJECT_NAME}`  当前项目的名称 
- `${TIME}`  当前系统时间 
- `${USER}`  当前用户的系统登录名 
- `${YEAR}`  当前年份
Apache Velocity 模板语言已使用