-- When user creates a gist
  -- make a directory with the gist files
  -- execute git init, git add, git commit in that directory
  -- change the name of the directory to the last commit sha
  -- save the directory name as first_sha and the head (latest sha) in the database
    -- INSERT INTO gists (user_id, first_sha, head, created_at, updated_at, deleted_at)

-- When user wants to see the latest gist
  -- Use the user_id to get the sha from gists table
  -- cat / shell the contents of the files in the directory to send in the API

-- When user wants to see revisions of the gist
  -- execute git log
  -- for each commit after the HEAD
    -- Execute git show to get the diffs
    -- interpret the diffs to know whether to show a diff or show file as deleted

-- When user wants to update a gist
  -- Diff edited files and directory to see if any files need to be deleted
  -- Delete any files in the directory that aren't in the edited files
  -- Add edited files to the directory
  -- execute git add, git commit
  -- update the database gist record with the latest sha  
      -- UPDATE gists SET head = sha, updated_at = now() WHERE first_sha = directory_name

-- When user wants to delete a gist
  -- get the latest sha from the gist
  -- UPDATE gists SET deleted_at = now() WHERE head = sha
