#!/usr/bin/env bash
# Mechanical style checks for one blog article.
# Usage: bash .claude/skills/recenzja-artykulu/check.sh src/content/blog/<file>.md
set -euo pipefail

file="${1:?Give the path to an article}"
blog_dir="$(cd "$(dirname "$file")" && pwd)"

exec perl -CSD -Mutf8 -e '
use strict; use warnings;
my ($file, $blog_dir) = @ARGV;
open my $fh, "<:encoding(UTF-8)", $file or die "Cannot open $file\n";
my @lines = <$fh>; close $fh;

my (%fm, $fm_state, $in_code, @para, $para_start);
$fm_state = 0; $in_code = 0;
my @issues;
sub add { push @issues, sprintf("%-22s linia %-4s %s", @_) }

my $lang = "en";
for my $l (@lines) { if ($l =~ /^lang:\s*"?(\w+)/) { $lang = $1; last } }

my $flush = sub {
  return unless @para;
  my $text = join " ", @para;
  my $n = () = $text =~ /[.!?…](?:\s|$)/g;
  add("akapit > 3 zdania", $para_start, "($n zdań)") if $n > 3;
  @para = ();
};

for my $i (0..$#lines) {
  my $ln = $i + 1;
  my $l = $lines[$i]; chomp $l;

  if ($fm_state < 2 && $l eq "---") { $fm_state++; next }
  if ($fm_state == 1) { $fm{$1} = $2 if $l =~ /^(\w+):\s*(.*)$/; next }

  if ($l =~ /^\s*(```|~~~)/) { $in_code = !$in_code; $flush->(); next }
  next if $in_code;

  # Strip inline code, HTML/MDX tags, imports and link URLs before prose checks.
  (my $p = $l) =~ s/`[^`]*`//g;
  next if $p =~ /^\s*(import|export)\s/;
  $p =~ s/<[^>]*>//g;
  $p =~ s/\]\([^)]*\)/]/g;

  add("pauza/półpauza", $ln, $1) while $p =~ /(.{0,25}[—–].{0,25})/g;

  if ($lang eq "pl") {
    if ($p =~ /"/) { my $c = () = $p =~ /"/g; add("cudzysłów prosty", $ln, "($c×) użyj „…”") }
    my $o = () = $p =~ /„/g; my $c = () = $p =~ /”/g;
    add("cudzysłów niedomknięty", $ln, "„=$o ”=$c") if $o != $c;
    while ($p =~ /(?<![\p{L}"„])(ty|ciebie|tobie|ci|cię|twój|twoja|twoje|twojego|twojemu|twoim|twojej|twoją|twoich|twoimi|wy|was|wam|wami|wasz|wasza|wasze|waszego|waszym|waszej|waszą|waszych)(?!\p{L})/g) {
      my $w = $1;
      next if $w eq "ci" || $w eq "wy";  # too ambiguous ("ci ludzie", "wy-" prefixes)
      add("zaimek małą literą", $ln, "\"$w\" -> wielka litera, jeśli zwrot do czytelnika");
    }
  } else {
    add("cudzysłów polski w EN", $ln, "") if $p =~ /[„”]/;
  }

  while ($l =~ /\]\((\/blog\/([^)\/#]+)\/?[^)]*)\)/g) {
    my ($url, $slug) = ($1, $2);
    add("martwy link", $ln, $url) unless -e "$blog_dir/$slug.md" || -e "$blog_dir/$slug.mdx";
  }

  if ($l =~ /^\s*$/ || $l =~ /^\s*([#>|*-]|\d+\.)/) { $flush->(); next }
  $para_start = $ln unless @para;
  push @para, $p;
}
$flush->();

for my $k (qw(title date excerpt lang)) { add("frontmatter", "-", "brak pola $k") unless exists $fm{$k} }
if (defined $fm{excerpt}) { my $len = length $fm{excerpt}; add("frontmatter", "-", "excerpt ma $len znaków (cel: do ~250)") if $len > 260 }
add("frontmatter", "-", "draft: true - pamiętaj przed publikacją") if ($fm{draft} // "") =~ /true/;

print "Plik: $file (lang: $lang)\n";
print @issues ? join("\n", @issues) . "\n" : "Brak uwag mechanicznych.\n";
' "$file" "$blog_dir"
