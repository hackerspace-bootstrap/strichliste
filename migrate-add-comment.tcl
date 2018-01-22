package require sqlite3
sqlite3 db data.sqlite
catch {db eval {alter table transactions add comment text;}}
#db eval {update transactions set comment=null} ;# DEBUG
set maxtimediff 10
set xs [db eval {select a.id, b.id, count(b.id), ua.name, ub.name from transactions as a inner join transactions as b on abs(a.value + b.value) < 0.01 and a.value < -0.09 and a.userId <> b.userId and abs(CAST(strftime('%s', a.createDate) as integer)-CAST(strftime('%s', b.createDate) as integer)) < $maxtimediff inner join users as ua on ua.id=a.userId inner join users as ub on ub.id=b.userId group by a.id having count(a.comment)=0 and count(b.comment)=0}]
db eval {begin transaction}
set skipped 0
set updated 0
foreach {a_id b_id cnt a_username b_username} $xs {
  if {$cnt != 1} {
    incr skipped
    continue
  }

  #if {$a_username eq "snowball" || $b_username eq "snowball"} {
  #  puts "$a_username $b_username"
  #}

  set c1 "from $a_username"
  set c2 "to $b_username"
  db eval {update transactions set comment=$c2 where id=$a_id}
  db eval {update transactions set comment=$c1 where id=$b_id}
  incr updated
}
db eval {commit}
puts "$updated transaction pairs have been updated, $skipped pairs have been skipped"
