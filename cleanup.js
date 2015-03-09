require("shelljs/global");

exec('rm -rf posts');
exec('rm .gitmodules');
exec('git rm -r posts');
exec('git rm .gitmodules');
