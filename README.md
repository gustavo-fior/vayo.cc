# DONE

- ✅ loading in login
- ✅ animate layout change button
- ✅ optimistic update
- ✅ public/private pages
- ✅ multiple lists per user
- ✅ responsiviness
- ✅ empty state
- ✅ implement [context menu](https://www.radix-ui.com/primitives/docs/components/context-menu) (dont know if its good or nah)
- ✅ figure out why some favicons dont work
- ✅ add a db query to verify if the bookmark already exists and is recent (maybe < 3 months?), so that we dont need to fetch favicon and og image again (now its only urls)
- ✅ address [this](https://nextjs.org/docs/messages/api-routes-response-size-limit) problem
- ✅ fix scroll bug in emoji picker and exit when selected
- ✅ add custom favicon and title to different folders
- ✅ add direction button (asc, desc) (API already supports it)
- ✅ migrate to jotai (migrated where global states are needed, really enjoyed it, made my life easier)
- ✅ add an option to verify duplicate
- ✅ save last view style and last sorting
- ✅ add some common favicons to speed up insert (maybe a problem if the website changes the logo, but i think it's worth it)
- ✅ focus when adding a new bookmark
- ✅ add confirmation when deleting a folder (deleted my whole list one time :´/)
- ✅ improve hover on bookmarks (keep only one bar that flows)
- ✅ update skeletons to last view style
- ✅ add light mode
- ✅ figure out why <img> tags are not being found
- ✅ instantly change to other folder when one is deleted
- ✅ make UI better and create a pattern (paddings, animations, texts) (probably have a menu that contains view style, direction, and sign out)
- ✅ add commons favicons as assets
- ✅ fix sun and moon icons in public pages
- ✅ maybe fetch folders with the bookmarks instead of creating 2 queries
- ✅ add month separation
- ✅ add a way to add a bookmark without opening the website (maybe a Chrome extension? google charges $5 for an account, fuck lp) (paid it) (waiting for approval) (done)
- ✅ keyboard shortcuts
- ✅ animate direction button
- ✅ default folder
- ✅ implement microlink api
- ✅ fix image error in public pages
- ✅ add smooth appearance to shared hover state (tried couple times, can't make it work :/) FINALLY
- ✅ add dynamic og to public pages
- ✅ fix custom og image
- ❌ fix sort update animation in public pages (removed it)
- ❌ preview yt videos (figured out there's no reason to implement this, the user can literally click and watch it on yt)
- ❌ add the last opened folder (folders are already sorted by the last update)
- ❌ add a funny image at the end if list is long (didn´t like it)
- ❌ maybe insert AI-generated og images when one can't be found (too crazy? yes u dumbass, definetily not a good idea + what if it's a bad image...)
- ❌ add search (why not just ctrl+f?)
- ❌ update things in db after 2 secs of no changes, not right after in every change (overengineering as fuck)
- ❌ fix ghost bookmarks when deleting (maybe useDebounce) (not happening in production)
- ⚠️ add animation to the deletion of a bookmark (tried a million times, need help)

# TODO

- 🟡 allow users to edit and have a custom sort for folders (will need to redesign the folders, maybe use [this](https://vaul.emilkowal.ski/))
- 🟡 improve perfomance
- 🟡 fix duplicate save in extension
- 🟡 cooldown in public page buttons
- 🟡 x icon does not work
- MAJOR redesign (use [rauno](https://twitter.com/raunofreiberg/status/1653471349854093327) as inspiration)

