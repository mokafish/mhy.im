#set( $fmt = "yyyy-MM-dd'T'HH:mm:ssXXX" )
#set( $now = $date.format($fmt, $date.time) )
---
title: '${NAME}'
date:  ${now}
update_at: ${TIME}
categories: []
tags: []
cover: null
author: ${USER}
published: false
layout: ../layouts/md.astro
---

## Section
Hello world.
