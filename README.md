# DONE

- ✅  loading in login
- ✅  animate layout change button
- ✅  optimistic update
- ✅  public/private pages
- ✅  multiple lists per user
- ✅  responsiviness
- ✅  empty state
- ✅  implement [context menu](https://www.radix-ui.com/primitives/docs/components/context-menu) (dont know if its good or nah)
- ✅  figure out why some favicons dont work
- ✅  add a db query to verify if the bookmark already exists and is recent (maybe < 3 months?), so that we dont need to fetch favicon and og image again (now its only urls)
- ✅  address [this](https://nextjs.org/docs/messages/api-routes-response-size-limit) problem
- ✅  fix scroll bug in emoji picker and exit when selected
- ✅  add custom favicon and title to different folders
- ✅  add direction button (asc, desc) (API already supports it)
- ✅  default folder
- ✅  migrate to jotai (migrated where global states are needed, really enjoyed it, made my life easier)  
- ✅  add an option to verify duplicate
- ✅  save last view style and last sorting
- ✅  add some common favicons to speed up insert (maybe a problem if the website changes the logo, but i think it's worth it) 
- ✅  focus when adding a new bookmark
- ✅  add confirmation when deleting a folder (deleted my whole list one time :´/)
- ✅  improve hover on bookmarks (keep only one bar that flows)
- ✅  update skeletons to last view style
- ✅  add light mode
- ✅  figure out why <img> tags are not being found
- ✅  instantly change to other folder when one is deleted
- ✅  make UI better and create a pattern (paddings, animations, texts) (probably have a menu that contains view style, direction, and sign out)
- ❌  preview yt videos (figured out there's no reason to implement this, the user can literally click and watch it on yt)
- ❌  add the last opened folder (folders are already sorted by the last update)

# TODO

- 🔴  x, airbnb and docs links don't work (tks Elon) (check https://www.pexels.com/@googledeepmind/)
- 🔴  animate direction button
- 🟡  allow users to edit and have a custom sort for folders
- 🟡  add month separation
- 🟡  add commons favicons as assets
- 🟢  add funny image at the end if list is long
- 🟢  add search
- 🟢  maybe insert AI-generated og images when one can't be found (too crazy?)
- 🟢  shared folder
- 🟢  add a way to add a bookmark without opening the website (maybe a Chrome extension?)
- 🟢  maybe fetch folders with the bookmarks instead of creating 2 queries
- 🟢  add smooth appearance to shared hover state
- 🟢  update things in db after 2 secs of no changes, not in every change
