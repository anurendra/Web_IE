import os
import sys
sys.path.append('/usr/local/lib/python2.7/site-packages')
import cv2
import caffe
import utils
import argparse
import tempfile
import subprocess
import numpy as np
# import _init_paths
import matplotlib.pyplot as plt
from utils import load_position_map
# from test import  get_probabilities_with_position
# from custom_layers.dom_tree import DOMTree
# import custom_layers.web_data_utils as data_utils
import sys
import warnings
warnings.filterwarnings("ignore")

def download_page(url):
    print ("Downloading:",url)
    print("ha ha ha")
    temp_dir = tempfile.mkdtemp()
    print(temp_dir)
    # temp_dir = tempfile.mkdir()
    result = subprocess.check_output(["phantomjs", "download_page.js",url,temp_dir])
    return temp_dir

if __name__ == "__main__":
	parser = argparse.ArgumentParser()
	parser.add_argument('--url', type=str, help='URL to classify', required=True)

	try:
		download_dir = download_page(url)

	except subprocess.CalledProcessError:
		print("Download was not succesfull")
		sys.exit(1)