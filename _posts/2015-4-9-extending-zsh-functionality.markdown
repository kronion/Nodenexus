---
title: "Shell Fu in zsh"
excerpt: "At a university where most classes use Java, familiarity with the shell seems <a href='http://en.wikipedia.org/wiki/Bernoulli_distribution'>Bernoulli-distributed</a>: you either customize to your heart’s desire or not at all. That means that many people can increase their productivity in the shell with only basic aliases, functions, and other simple tricks. Using the Z shell, we’ll start with the low-hanging fruit by installing Oh My Zsh, move on to theme customization, and conclude with an introduction to shell functions. Welcome to the world of shell fu."
---

Programmers are a lot like exotic car owners. We live for the cutting edge and the most efficient solutions. We're not afraid of a little (or a lot) of DIY. Some of us are actually crazy enough to [cool our rigs with liquid nitrogen in the name of clock-speed records][nitrogren]. I'm sure supercar enthusiasts would understand.

Whereas auto modding is all in the physical world, however, computer performance is a function of hardware and software tuning. Despite being the proud builder of my own (air-cooled) gaming rig, I'll be the first to admit that I don't really know too much about hardware hackery. I do, however, have some tips when it comes to fine-tuning your development environment. Let me share with you some secrets of shell fu.

At a university where many (most?) classes use Java, shell fu technique seems [Bernoulli-distributed][bernoulli]: you either customize to your heart's desire or not at all. That means that many people could increase their productivity in the shell with just a couple of aliases and other simple tricks. I'll start with the low-hanging fruit and then move on to some more advanced tweaks for those of you who have seen some things before.

## Oh. My. Zsh.

[bash (the Bourne-again shell)][bash] is probably the world's most popular shell. Unless you've changed it yourself, your machine's default shell is almost certainly bash. As the de facto standard, bash is a time-tested option with good documentation. That being said, if you're not afraid of new things, I highly suggest that you make a leap of faith and make the Z shell your default.

What's the difference between zsh and bash, you ask? zsh was built to be a csh replacement with support for many ksh features, particularly autocompletion. Its scripting language is similar to bash's with various syntactic quirks.[^1] Unless you have a lot of experience with many different shells, you probably won't notice the behind-the-scenes distinctions. What you will notice, however, is the incredible out-of-the-box user experience that zsh provides over bash.

Simply put, zsh makes it incredibly easy to execute commands and navigate directories. With built in features like global aliases (put aliases inside other expressions!) and filepath completion (press <kbd>tab</kbd> to toggle through each potential match), you'll wonder how you ever tolerated using a terminal without them. You'll _cringe_ the next time you try to use your friend's shell and it's bash.

There are so many excellent features packed into zsh that I can't possibly cover them all here. In fact, I still haven't discovered everything zsh has to offer. The slides below cover the absolute essentials you should know when you upgrade from bash.

<div class="flex">
  <div>
    <iframe src="//www.slideshare.net/slideshow/embed_code/16194692" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe>
    <div style="margin-bottom:5px">
      <strong> <a href="//www.slideshare.net/jaguardesignstudio/why-zsh-is-cooler-than-your-shell-16194692" title="Why Zsh is Cooler than Your Shell" target="_blank">Why Zsh is Cooler than Your Shell</a> </strong> from <strong><a href="//www.slideshare.net/jaguardesignstudio" target="_blank">jaguardesignstudio</a></strong>
    </div>
  </div>
</div>

In the event that you skipped the slides above (for shame!), let me draw your attention to [Oh My Zsh][oh-my-zsh]. In their own words:

<blockquote>
  <p>
    Oh My Zsh is an open source, community-driven framework for managing your zsh configuration. That sounds boring. Let's try this again.

    <strong>Oh My Zsh is a way of life!</strong> Once installed, your terminal prompt will become the talk of the town <em>or your money back!</em>
  </p>
</blockquote>

Once you install Oh My Zsh, you'll be able to use dozens of premade shell prompts ("themes") and functions ("plugins"), all located in ~/.oh-my-zsh. Want a flashy shell befitting a true hacker? One of the 138 included themes in ~/.oh-my-zsh/themes is bound to suit your needs. Are you tired of navigating back and forth between the shell and browser to create a new GitHub repository? [There's a plugin for that][github]. In fact, there are [so many plugins that somebody made a list][plugins]. Swapping themes or plugins is as easy as changing a line in your .zshrc file.

Oh My Zsh is also easy to extend yourself; just put your own scripts, themes, and plugins in ~/.oh-my-zsh/custom. Oh My Zsh will automatically source the scripts, though you'll still have to change your .zshrc to specify the use of custom themes and plugins. Note that custom plugins and themes go in ~/.oh-my-zsh/custom/plugins and ~/.oh-my-zsh/custom/themes, respectively.

Now let's see some custom enhancements. While everything that follows is written from the perspective of a zsh user, the lessons (and even most of the code) can be adapted for bash.

## The Pearl Within

The first thing most people notice about zsh is its support for better user prompts than what bash can provide. Whereas bash allows prompt customization via the `PS1` variable, zsh provides two variables: `PROMPT` and `RPROMPT`. As you might guess, `PROMPT` is the replacement for `PS1`, while `RPROMPT` is a second, right-justified prompt. That's right, now you can have your prompt display information on both sides of the window!

An awful lot has been already been written about shell prompt customization. For example, Steve Losh has a wonderful blog post detailing how to [create a prompt complete with a battery indicator][losh]. My own prompt is adapted from Losh's example. It looks like this:

<pre><code class='terminal'><strong>cstedman</strong><span style="color: #ee7f2d; font-size: 100%;">@</span><strong>nebulose</strong> <span style="color: #ee7f2d; font-size: 100%;">➤</span>  <span style="color: #aaa; font-size: 100%;">LVL 1</span> <span class="line" style="color: #ee7f2d; font-size: 100%;">--------------------------------------------------------</span> <span class="date" style="color: #aaa; font-size: 100%;">Tue Apr 07 2015</span> <span style="color: #ee7f2d; font-size: 100%;">➤</span>  <span class="time" style="color: #aaa; font-size: 100%;">17:00</span>
<span style="color: #ee7f2d; font-size: 100%;">~</span> <span style="color: red; font-size: 100%;">±</span> <span style="color: yellow; font-size: 100%">蛇</span> <span style="color: #53d646; font-size: 100%;">✓</span> <span class="cursor" style="color: #aaa; font-size: 100%;">█</span>                  <span class="spaces">                                                        </span>                <span class="battery" style="color: yellow; font-size: 100%;">▸▸▸▸▸▸▹▹▹▹</span></code></pre>
<script type="application/javascript" src="/js/posts/extending-zsh-functionality.js"></script>

Here is the corresponding .zsh-theme file:

{% highlight bash linenos %}
# Variables for precmd
LONG_HOST=$(hostname)
SHORT_HOST=${LONG_HOST[(ws:.:)1]}
HOST_LEN=${#SHORT_HOST}
LSCOLORS=hxfxcxdxHxegedabagacad
BAT_CHARGE='/Users/cstedman/Code/Shell/config/batcharge.py'

# Precommand which runs before redrawing the prompt
function precmd() {
  RPROMPTGOAL=${(z)$($BAT_CHARGE 2>/dev/null)}
  RPROMPT="%{$RPROMPTGOAL[1]%}$RPROMPTGOAL[2]%{$RPROMPTGOAL[3]%}"
  LINENUM=""
  for ((i = 0; i < $COLUMNS - 45 - $HOST_LEN; i++)); do LINENUM="${LINENUM}-"; done
  if test -n "$VIRTUAL_ENV" ; then
    PROMPT=$_OLD_VIRTUAL_PS1
  fi
}

# Indicate that the CWD is a git or mercurial repository
function vcsCheck {
    git branch >/dev/null 2>/dev/null && echo '± ' && return
    hg root >/dev/null 2>/dev/null && echo '☿ ' && return
}

# Indicate that the CWD contains a python virtualenv (white snake symbol),
# or that a virtualenv is active (yellow snake symbol)
function virtualenvCheck {
  if [[ -a bin/activate ]] || test -n "$VIRTUAL_ENV" ; then
    if test -n "$VIRTUAL_ENV" ; then
      echo "$fg_bold[yellow]蛇 $reset_color"
    else
      echo "$fg[white]蛇 $reset_color"
    fi
  fi
}

PROMPT='%(!.%{$fg_bold[red]%}.%{$fg_bold[white]%})%n%{$reset_color%}@%{$fg_bold[white]%}%m%{$reset_color%} ➤  %(5L.%{$fg[red]%}.%(3L.%{$fg[yellow]%}.%{$fg[white]%}))LVL $SHLVL%{$reset_color%} $LINENUM %{$fg[white]%}{% raw %}%D{%a{% endraw %} %b %d %Y}%{$reset_color%} ➤  %(2T.%{$fg_bold[red]%}.%(1T.%{$fg_bold[red]%}.%{$fg[white]%}))%T%{$reset_color%}
%(2j.%{$fg_bold[red]%}%j .%(1j.%{$fg_bold[yellow]%}%j .))%{$reset_color%}%~ %{$fg_bold[red]%}$(vcsCheck)%{$reset_color%}$(virtualenvCheck)%(?.%{$fg_bold[green]%}✓.%{$fg_bold[red]%}✗)%{$reset_color%} '
{% endhighlight %}

This file looks pretty ugly, and unfortunately that tends to be true of most shell scripts. In particular, the syntax for PROMPT and RPROMPT is completely inscrutable to human beings. To make matters worse, search engines generally will not return relevent results if you make queries like "zsh %{". Here are [two][cheatsheet1] [cheatsheets][cheatsheet2] to help you decipher the prompt. Again, I adapted my prompt from [Losh's example][losh], so I recommend reading his post if you're confused by anything you see here. I'm only going to focus on the `precmd` and `virtualenvCheck` functions.

`precmd` is a special function in zsh.[^2] If defined, zsh will execute the function immediately before it draws the shell prompt. I use it to update the battery indicator and scale my prompt to different pane or terminal widths. I use `RPROMPT` for the battery indicator only; everything else is part of `PROMPT`. Therefore, in order to get the date and time to appear right-aligned in the pane, I change the length of the line of dashes with `precmd`. To get the target length for the line, I use the `COLUMNS` environment variable to get the width of the pane, subtract the number of characters that never change (such as the date and time), and then subtract the length of the hostname (which can change).

Notice that I do not define `RPROMPT` in the same way that Losh does. For some reason, his method did not work for me, so I had to modify his Python script to return the indicator and color separately. Here's the new code:

{% highlight python linenos %}
#!/usr/bin/env python
# coding=UTF-8

import math, subprocess

p = subprocess.Popen(["ioreg", "-rc", "AppleSmartBattery"], stdout=subprocess.PIPE)
output = p.communicate()[0]

o_max = [l for l in output.splitlines() if 'MaxCapacity' in l][0]
o_cur = [l for l in output.splitlines() if 'CurrentCapacity' in l][0]
o_chr = [l for l in output.splitlines() if 'IsCharging' in l][0]

b_max = float(o_max.rpartition('=')[-1].strip())
b_cur = float(o_cur.rpartition('=')[-1].strip())
b_chr = o_chr.rpartition('=')[-1].strip()

charge = b_cur / b_max
charge_threshold = int(math.ceil(10 * charge))

# Output

total_slots, slots = 10, []
filled = int(math.ceil(charge_threshold * (total_slots / 10.0))) * u'▸'
empty = (total_slots - len(filled)) * u'▹'

out = (filled + empty).encode('utf-8')
import sys

color_green = "$fg_bold[green]"
color_yellow = "$fg_bold[yellow]"
color_red = "$fg_bold[red]"
color_cyan = "$fg_bold[cyan]"
color_reset = "$reset_color"
color_out = (
        color_cyan if b_chr == 'Yes'
            else color_green if len(filled) > 6
                else color_yellow if len(filled) > 4
                    else color_red
                    )

out = color_out + ' ' + out + ' ' + color_reset
sys.stdout.write(out)
{% endhighlight %}

Next, let's look at `virtualenvCheck`. This function checks for two different conditions. First, if a Python virtualenv is currently active, it represents this fact with 蛇 (the Chinese character for "snake") in yellow. Second, if the CWD contains an inactive virtualenv, the 蛇 character is white instead of yellow. The function itself is very easy to understand; it just checks for the presence of environment variables created by virtualenv. `precmd` also checks for one of these environment variables to prevent virtualenv from modifying the prompt. By default, an active virtualenv will prepend the name of the directory in which it is contained. I decided to disable that behavior because it ruined the spacing of the prompt, and I am able to infer the location of the virtualenv from context.

That's pretty much everything to say about my zsh theme. The main lesson is to use shell functions to make the prompt dynamic and expressive. If you're dead-set on bash, the same lesson applies, but unfortunately you miss out on `RPROMPT`. Next up, we'll look at how we can use functions to simplify common tasks and "overload" system binaries to change their behavior.

## What's Your Function?

As I mentioned before, Oh My Zsh provides dozens of helpful plugins for [Django, Ruby, Node, Sublime, and many more tools][plugins]. If you've already loaded some plugins in your .zshrc file, you can run `functions | less` to see all available functions (but note that functions starting with underscores are not meant to be called by users directly).

Sometimes, however, you just won't be able to find the right tool for the job. No worries! As programmers, we'll make our own solution. Just write a function in ~/.oh-my-zsh/custom/ARBITRARY-NAME.zsh, and zsh will pick it up automatically.[^3] Type the name of the function into the shell (no parentheses) and PRESTO! Let's look at two examples:

{% highlight bash linenos %}
#
# Open the .gitignore in the current repository, or prompt the user to create
# one if it does not already exist
#
function gitignore() {
  setopt local_options no_case_match
  local GIT_CHECK=$(git rev-parse --show-toplevel 2> /dev/null) 
  if ! [[ -n $GIT_CHECK ]]; then
    echo "${fg_bold[red]}Error:${reset_color} Directory is not a git repository"
    false
  else
    if [[ -a $GIT_CHECK/.gitignore ]]; then
      $EDITOR $GIT_CHECK/.gitignore
    else
      local tmp
      vared -p 'No .gitignore found. Create one? (y/n) ' tmp
      if [[ $tmp =~ "^(y|yes)$" ]]; then
        echo ".DS_Store\n*.swp" >> $GIT_CHECK/.gitignore
      else
        false
      fi
    fi
  fi
}
{% endhighlight %}

Every time I start a new project, one of the first things I do is create a .gitignore file to prevent myself from checking in project dependencies, swap files, and application credentials. I occasionally need to make changes to this file, which entails navigating to the root directory of the application and typing `vim .gitignore`. Not so bad, right? Maybe not, but we can do better. Currently, we can't tab-complete the file until we've typed `vim .giti`, because otherwise zsh doesn't know if we mean .gitignore or the .git directory. Fix the completion issue, add in the ability to open or create the file from anywhere in the project directory, and we have a perfect use-case for a zsh function.

If you understood the functions in the .zsh-theme file, this new example should be relatively easy to follow. A few notes:

1. `setopt local_options no_case_match` makes the regex match on line 17 case-insensitive. 
2. I use local variables using the `local` keyword in order to avoid polluting the environment unnecessarily.
3. The command `git rev-parse --show-toplevel` returns the root of the git repository, assuming we are within one. Otherwise it throws an error that we pipe to /dev/null.
4. `vared` prints the string following the `-p` option, waits for user input, and stores the value in the variable given.
5. I assume that the user has specified the path to the binary of their favorite editor in the `EDITOR` variable. We want to avoid hard-coding, of course!

While writing this post, I found out that Oh My Zsh already has its own `gitignore` plugin. From what I can tell, it uses [gitignore.io][gitignore] to generate language-specific .gitignore files. I haven't used it, and I'll probably just stick to my own solution, but it may be worth a look before you use my code.

Our first example demonstrates how to use zsh functions to simplify basic actions and save time. The function we created had a name that didn't conflict with any other executables in our PATH. Avoiding name conflicts is important because zsh actually tries to resolve command names with functions _first_, before searching the PATH. So what happens if we make a function called `gcc`? If done carelessly, the result will be the disruption of C program compilation. However, the ability to override executables also gives us a way to make transparent wrapper functions that augment default behavior. Let's see one more example:

{% highlight bash linenos %}
#
# Open multiple files in vim with vertical split
# 
function vim() {
  if [[ $# -ge 2 ]]; then
    $EDITOR $@ -O
  else
    $EDITOR $@
  fi
}
{% endhighlight %}

This function is obviously very simple, but its implications are vast. Every time I type the word `vim` in my shell, this function is called instead of the real vim binary. It looks at the number of arguments provided to the function and decides how to invoke the binary depending on the result. If one argument is found, the function calls vim normally. Otherwise, it instructs vim to open the files in parallel vertical windows. Normally, vim handles multiple file arguments by opening one buffer at a time, starting with the first argument, and opening each subsequent buffer when the previous one is closed. I dislike the default behavior because I either provided the second filename by mistake (and I'd like to solve the problem immediately) or I actually did want to see both files at the same time (in which case I'd prefer the parallel window option to be the default).

Again, notice that I'm using the `EDITOR` variable as a stand-in for the full filepath to the vim binary. If you decide to override other executables using this pattern, you'll need to hardcode the full paths or create your own environment variables. You cannot just use the original command name, as zsh will again perform a lookup in the list of functions first, causing an infinite loop.

While the code examples above are all zsh scripts, similar programs may be written for bash. However, while Oh My Zsh provides a safe place to put custom scripts in ~/.oh-my-zsh/custom, bash users will have to make their own local scripts directory and prepend it to their PATH.

## From A to Zsh

If you're just beginning to learn the ways of shell fu, I hope I've convinced you to at least give zsh a try. Whether you're building complex themes or autocompleting git commands, zsh is a blast to use. Personally, I'm most excited about executable overloading, and I plan on doing much more of it. Have any ideas for executables to extend with scripting? Think you can give a better example? Have the best prompt in town? I'd love to see what you come up with. Happy hacking!

[nitrogren]: https://www.youtube.com/watch?v=LrsN3r_gVJU
[bernoulli]: http://en.wikipedia.org/wiki/Bernoulli_distribution
[bash]: http://en.wikipedia.org/wiki/Bash_%28Unix_shell%29
[oh-my-zsh]: https://github.com/robbyrussell/oh-my-zsh
[github]: https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/github
[plugins]: https://github.com/robbyrussell/oh-my-zsh/wiki/Plugins-Overview
[losh]: http://stevelosh.com/blog/2010/02/my-extravagant-zsh-prompt/
[cheatsheet1]: http://www.bash2zsh.com/zsh_refcard/refcard.pdf
[cheatsheet2]: http://zsh.sourceforge.net/Doc/Release/Prompt-Expansion.html
[gitignore]: https://www.gitignore.io/
[prompt]: http://tldp.org/HOWTO/Bash-Prompt-HOWTO/x264.html

[^1]: Though, really, all shell scripting languages are pretty quirky.
[^2]: Bash provides an alternative called [PROMPT_COMMAND][prompt].
[^3]: If you plan on making something a little more robust, or you have multiple functions, consider creating a plugin. Put your work in ~/.oh-my-zsh/custom/plugins/YOUR-PLUGIN/YOUR-PLUGIN.plugin.zsh, and make sure to include the plugin in your .zshrc: `plugins=(..... YOUR-PLUGIN ....)`.
