import sys
def prRed(skk): print("\033[91m {}\033[00m".format(skk), file=sys.stderr)
def prGreen(skk): print("\033[92m {}\033[00m".format(skk), file=sys.stderr)
def prYellow(skk): print("\033[93m {}\033[00m".format(skk), file=sys.stderr)