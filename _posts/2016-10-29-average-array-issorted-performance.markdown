---
title: "Average Time to Check If an Array Is Sorted"
---

It's always a pleasure to find interesting problems hiding in seemingly mundane places. Recently a colleague of mine posed the following twist on a basic algorithms question. It's easy to see that the worst-case performance to check if a random \\(n\\)-length array is sorted is \\(O(n)\\). But what is the _average_ performance? Is it still linear? Sublinear? Is it a function of the length at all?

Throughout this post, we'll assume that all arrays are drawn uniformly at random from the set of \\(n\\)-length arrays containing the numbers \\(1\\) through \\(n\\) with no duplicates. Of course, if an adversary is providing the input arrays, you should expect the average and worst cases to be the same.

Let's start out by writing out exactly what we're trying to compute. We check if a random array is sorted by performing comparisons between each adjacent pair of elements, returning either when we find an inversion or reach the end. The average performance is equal to the expected number of comparisons needed to find the first inversion in a random array. That is,

$$ E[C] = \sum_{i=1}^{n-1} P(c_i) * i $$

where \\(C\\) is the random variable for the number of comparisons performed, \\(c_i\\) is the index (starting at one) of the first inversion, \\(P(c_i)\\) is the probability of seeing it at that location, and \\(n\\) is the array length.

That's the simple expression, but for reasons that I'll explain momentarily, we'll rewrite it using conditional probabilities:

$$ \small E[C] = P(c_1) + P(\overline{c_1}) * \bigg( P(c_2|\overline{c_1}) * 2 + P(\overline{c_2}|\overline{c_1}) * \Big(... + P(\overline{c_{n-2}}|\overline{c_1},...,\overline{c_{n-3}}) * (n-1)\Big)\bigg) $$

where \\(P(\overline{c_i})\\) is the complement of \\(P(c_i)\\), or \\(1 - P(c_i)\\). We can see that quations \\((1)\\) and \\((2)\\) are equal by distributing the complementary terms, working from the outside in.

Now we need to find a way to compute the values for the probabilities. If the array were small, say four elements long, we could just enumerate all sorted subarrays and count how many of the remaining choices of next element introduce inversions. The subarrays are sorted because, as the conditional probabilities represent, we are interested in the likelihood of seeing the _first_ inversion when we append the next element. The conditional probabilities save us from having to enumerate subarrays beyond their first inversions, saving a little time and memory in a program.

$$
\notag
\begin{array}{c|c|c}
  \text{Subarray} & \text{# Choices} & \text{# Causing Inversions} \\
  \hline
  [1] & 3\ (2, 3, 4) & 0 \\
  [2] & 3\ (1, 3, 4) & 1\ (1) \\
  [3] & 3\ (1, 2, 4) & 2\ (1, 2) \\
  [4] & 3\ (1, 2, 3) & 3\ (1, 2, 3) \\
  \hline
  \text{Section Total} & 12 & 6 \\
  \hline
  [1,2] & 2\ (3, 4) & 0 \\
  [1,3] & 2\ (2, 4) & 1\ (2) \\
  [1,4] & 2\ (2, 3) & 2\ (2, 3) \\
  [2,3] & 2\ (1, 4) & 1\ (1) \\
  [2,4] & 2\ (1, 3) & 2\ (1, 3) \\
  [3,4] & 2\ (1, 2) & 2\ (1, 2) \\
  \hline
  \text{Section Total} & 12 & 8 \\
  \hline
  [1,2,3] & 1\ (4) & 0 \\
  [1,2,4] & 1\ (3) & 1\ (3) \\
  [1,3,4] & 1\ (2) & 1\ (2) \\
  [2,3,4] & 1\ (1) & 1\ (1) \\
  \hline
  \text{Section Total} & 4 & 3 \\
\end{array}
$$

Of course, we want to answer the question for much larger arrays, so let's write a quick and dirty script:

{% highlight python linenos %}
#!/usr/bin/env python

#
# inversion_count.py
#

from collections import deque
import sys


def main():
    arr_length = int(sys.argv[1])

    # Use a deque like a linked list
    states = deque()
    for i in xrange(arr_length):
        choices = set()

        for j in xrange(arr_length):
            if i != j:
                choices.add(j)

        states.append({
            "progress": [i],
            "choices": choices
        })

    results_by_length = {}

    while len(states) > 0:
        state = states.popleft()
        state_length = len(state["progress"])

        # If we haven't seen a subarray of this length, add category to results
        if state_length not in results_by_length:
            results_by_length[state_length] = {
                "total": 0,
                "inverted": 0
            }

        for choice in state["choices"]:
            results_by_length[state_length]["total"] += 1

            if state["progress"][-1] > choice:
                results_by_length[state_length]["inverted"] += 1
            else:
                # We only add a new state if our progress in sorted...
                choices = set(state["choices"])
                choices.remove(choice)

                if choices:
                    # And there are still choices available to the new state
                    new_progress = list(state["progress"])
                    new_progress.append(choice)

                    new_state = {
                        "progress": new_progress,
                        "choices": choices
                    }
                    states.append(new_state)

    for length, result in results_by_length.iteritems():
        print("%d: %d / %d" % (length, result["inverted"], result["total"]))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print "Usage error: Expects desired array length as an argument"
    else:
        main()
{% endhighlight %}

<pre class='terminal'><code>$ chmod +x inversion_count.py
$ ./inversion_count.py 3
1: 3/6
2: 2/3
$ ./inversion_count.py 5
1: 10 / 20
2: 20 / 30
3: 15 / 20
4: 4 / 5
$ ./inversion_count.py 10
1: 45 / 90
2: 240 / 360
3: 630 / 840
4: 1008 / 1260
5: 1050 / 1260
6: 720 / 840
7: 315 / 360
8: 80 / 90
9: 9 / 10
</code></pre>

We can see see that the probability of seeing the first inversion on the \\(i\\)th comparison follows the sequence

$$ \notag \frac{1}{2}, \frac{2}{3}, \frac{3}{4}, \frac{4}{5}... $$

regardless of the length of the array. So we can plug back into equation \\((2)\\):

$$
E[C] = \frac{1}{2} + \frac{1}{2} \bigg( \frac{2}{3} * 2 + \frac{1}{3} \Big( \frac{3}{4} * 3 + \frac{1}{4} \big(... + \frac{1}{n-2} * (n - 1) \big) \Big) \bigg)
$$

Now we distribute the fraction multiplication across the nested expressions and get the coefficient sequence

$$ \notag \frac{1}{2}, \frac{1}{3}, \frac{1}{8}, \frac{1}{30}, \frac{1}{144}, \frac{1}{840} ... $$

Luckily enough for people like myself who don't see the pattern immediately, the Online Encyclopedia of Integer Sequences has [an entry][OEIS] for this sequence[^1]:

$$ a(n) = \frac{n}{(n+1)!} $$

Thus we have everything we need to rewrite equation \\((2)\\) cleanly:

$$
E[C] = \sum_{i=1}^{n-1} \frac{n^2}{(n+1)!}
$$

Expanding out the terms, we can see the sum converges to a familiar and unexpected value.

$$
E[C] = \frac{1}{2} + \frac{2}{3} + \frac{3}{8} + \frac{4}{30} + \frac{5}{144} + \frac{6}{840} + ... \approx 1.718281 = e - 1
$$

I don't claim to understand why Euler's Number is involved, but I find it both curious and convenient that the expected time it takes to check for array sortedness is constant. Even as your arrays grow extremely large, you can rest easy knowing your function `isSorted(arr)` is unlikely to take anywhere close to linear time.

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML" type="text/javascript"></script>
<script typ="text/x-mathjax-config">
MathJax.Hub.Config({
  TeX: { equationNumbers: { autoNumber: "all" } }
});
</script>

[^1]: Note that OEIS has the equation for the sequence in the numerator, so we use the inverse.

[OEIS]: http://oeis.org/A001048
