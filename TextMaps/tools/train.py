import os
import sys
import caffe
import pickle
import utils
import test
import random
import argparse
import numpy as np
import google.protobuf as pb2
import matplotlib.pyplot as plt
from caffe.proto import caffe_pb2
from sklearn.preprocessing import normalize
#Added later
from utils import load_position_map

def snapshot(net, snapshot_path):
    net.save(snapshot_path)

def load_position_maps(position_map_path):
     #--- LOAD SMOTHED POSITION MAPS
    position_maps = []
    for i in range(4):
        path = os.path.join(position_map_path,str(i)+'.pkl')
        position_maps.append(load_position_map(path,sigma=80))
    return position_maps

#----- MAIN PART
if __name__ == "__main__":

    #--- Get params
    parser = argparse.ArgumentParser()
    parser.add_argument('--split', type=int, default=1, help='Split number')
    parser.add_argument('--solver', type=str, default=os.path.join(os.environ["HOME"],'TextMaps/models/solver.prototxt'), help='solver prototxt')
    parser.add_argument('--test_model', type=str, default=os.path.join(os.environ["HOME"],'TextMaps/models/test.prototxt'), help='test net prototxt')
    parser.add_argument('--weights', help='initialize with pretrained model weights',
                        default=os.path.join(os.environ["HOME"],'fast-rcnn/data/imagenet_models/CaffeNet.v2.caffemodel'), type=str)
    parser.add_argument('--train_iters', type=int, default=5, help='Number of iterations for training')
    parser.add_argument('--test_iters', type=int, default=5, help='Number of iterations for testing')
    parser.add_argument('--experiment', type=str, default='naive_test', help='name of experiment')  
    #Below line Added for now only  
    parser.add_argument('--position_maps_dir', type=str, default='../models/likelihoods/', help='Number of iterations for training')

    args = parser.parse_args()
    
    #-- Load params
    split_name = str(args.split)
    train_iters = args.train_iters
    final_test_iters = args.test_iters
    solver_path = args.solver
    test_model = args.test_model
    pretrained_weights = args.weights    
    experiment = args.experiment
    #Added for now only
    position_map_path = args.position_maps_dir

    #--- GET DATA PATHS
    #Change to own data path
    # train_data = utils.get_train_data_path(split_name)
    # test_data = utils.get_test_data_path(split_name)

    #Test check training
    train_data = os.path.join(os.environ["HOME"],'TextMaps/data_shops/page_sets/download_page_list.txt')

    test_data = os.path.join(os.environ["HOME"],'TextMaps/data_shops/page_sets/download_page_list.txt')
    print('train path', train_data)

    #--- LOAD SMOTHED POSITION MAPS
    # position_maps = utils.load_position_maps(split_name, 80)   
    position_maps = load_position_maps(position_map_path) 

    #--- GET TEST RESULTS PATH
    # test_res_path = utils.get_result_path(experiment, split_name)

    ###--- LOAD SOLVER PARAMS
    solver_param = caffe_pb2.SolverParameter()


    #Uncomment later- anu
    # with open(solver_path, 'rt') as f:
    #     pb2.text_format.Merge(f.read(), solver_param)

    ###--- LOAD SOLVER
    caffe.set_mode_gpu()
    solver = caffe.SGDSolver(solver_path)

    ###--- TRAIN
    #-- set input data and pretrained model
    train_net = solver.net
    print('loading pretrained weights')
    train_net.copy_from(pretrained_weights)
    train_net.layers[0].set_data(train_data)

    #-- make steps
    num_steps = 1
    test_every_n_iters = 1
    val_iters = 1

    print('Entering training iteration')
    print(train_iters/num_steps)

    losses = []
    for i in range(train_iters/num_steps):
        #-- update
        print('before iteration')
        print(i)
        solver.step(num_steps)
        iteration=(i+1)*num_steps
        print('after iteration')
        #-- print loss
        print('----------------------')
        print('Iteration:',str(iteration))
        losses.append(train_net.blobs['loss'].data.copy())
	print('Loss:',train_net.blobs['loss'].data)
        sys.stdout.flush()

        #-- create snapshot and test
        if iteration%test_every_n_iters==0:
            print 'Snapshoting and Testing'
            sys.stdout.flush()

            #-- snapshot
            snapshot_path = utils.get_snapshot_name(experiment, split_name, iteration)
            print(snapshot_path)
            snapshot(train_net, snapshot_path)

            #-- test
            net_results, position_results = test.test_net(test_model, snapshot_path, test_data, val_iters, position_maps)
           
            im_acc, price_acc, name_acc = net_results
            print 'NET: image accuracy:', im_acc
            print 'NET: price accuracy:', price_acc
            print 'NET: name accuracy:', name_acc
           
            p_im_acc, p_price_acc, p_name_acc = position_results
            print 'NET+POSITION: image accuracy:', p_im_acc
            print 'NET+POSITION: price accuracy:', p_price_acc
            print 'NET+POSITION: name accuracy:', p_name_acc
            
            sys.stdout.flush()

    ###--- FINAL SNAPSHOT
    print('Out of the iteration')
    snapshot_path = utils.get_snapshot_name(experiment, split_name,train_iters)
    train_net.save(snapshot_path)

    ###--- FINAL TEST
    print 'Final testing'
    sys.stdout.flush()

    net_results, position_results = test.test_net(test_model, snapshot_path, test_data, final_test_iters, position_maps)

    im_acc, price_acc, name_acc = net_results
    print 'NET: image accuracy:', im_acc
    print 'NET: price accuracy:', price_acc
    print 'NET: name accuracy:', name_acc

    p_im_acc, p_price_acc, p_name_acc = position_results
    print 'NET+POSITION: image accuracy:', p_im_acc
    print 'NET+POSITION: price accuracy:', p_price_acc
    print 'NET+POSITION: name accuracy:', p_name_acc
    sys.stdout.flush()
    plt.plot(losses)
    plt.show()
    ###--- save results
    # with open(test_res_path, 'w+') as f:
    #     f.write('NET: image accuracy: '+str(im_acc)+"\n")
    #     f.write('NET: price accuracy: '+str(price_acc)+"\n")
    #     f.write('NET: name accuracy: '+str(name_acc)+"\n")
    #     f.write('\n')
    #     f.write('NET+POSITION: image accuracy: '+str(p_im_acc)+"\n")
    #     f.write('NET+POSITION: price accuracy: '+str(p_price_acc)+"\n")
    #     f.write('NET+POSITION: name accuracy: '+str(p_name_acc)+"\n")
